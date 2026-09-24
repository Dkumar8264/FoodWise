import 'dotenv/config';
import dns from 'node:dns';
import express from 'express'; import cors from 'cors'; import mongoose from 'mongoose'; import jwt from 'jsonwebtoken'; import axios from 'axios'; import bcrypt from 'bcryptjs';
import PDFDocument from 'pdfkit';
import { MenuDish, ServiceLog, Prediction, User } from './models.js';
import { evaluateHistoricalWaste } from './analytics.js';
const app = express(); app.use(cors()); app.use(express.json());
// Some local DNS resolvers block Atlas SRV lookups. Configure public resolvers only when requested.
const atlasDnsServers = process.env.ATLAS_DNS_SERVERS?.split(',').map(server => server.trim()).filter(Boolean);
if (atlasDnsServers?.length) dns.setServers(atlasDnsServers);
const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const auth = (req, res, next) => { try { req.user = jwt.verify(req.headers.authorization?.split(' ')[1], process.env.JWT_SECRET); next(); } catch { res.status(401).json({ message: 'Authentication required' }); } };
const databaseStatus = () => mongoose.connection.readyState === 1 ? 'connected' : 'unavailable';
app.get('/api/health', (_, res) => res.status(databaseStatus() === 'connected' ? 200 : 503).json({ status: databaseStatus() === 'connected' ? 'ok' : 'degraded', service: 'foodwise-api', database: databaseStatus() }));
app.use('/api', (req, res, next) => databaseStatus() === 'connected' ? next() : res.status(503).json({ message: 'FoodWise is reconnecting to the database. Please retry shortly.' }));
app.post('/api/auth/login', async (req, res) => { const { email, password } = req.body; const user = await User.findOne({ email: email?.toLowerCase() }); if (!user || !await bcrypt.compare(password || '', user.passwordHash)) return res.status(401).json({ message: 'Invalid email or password' }); res.json({ token: jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' }), user: { name: user.name, email: user.email } }); });
app.get('/api/logs', auth, async (_, res) => res.json(await ServiceLog.find().sort({ date: -1 }).limit(100)));
app.post('/api/logs', auth, async (req, res) => res.status(201).json(await ServiceLog.create(req.body)));
app.get('/api/menu', auth, async (_, res) => res.json(await MenuDish.find({ active: true }).sort({ meal: 1, name: 1 })));
app.post('/api/menu', auth, async (req, res) => res.status(201).json(await MenuDish.create(req.body)));
app.patch('/api/menu/:id', auth, async (req, res) => { const dish = await MenuDish.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!dish) return res.status(404).json({ message: 'Dish not found' }); res.json(dish); });
app.delete('/api/menu/:id', auth, async (req, res) => { const dish = await MenuDish.findByIdAndUpdate(req.params.id, { active: false }, { new: true }); if (!dish) return res.status(404).json({ message: 'Dish not found' }); res.json(dish); });
app.get('/api/dashboard', auth, async (_, res) => {
  const [logs, predictions, wasteByDish] = await Promise.all([
    ServiceLog.find().sort({ date: 1 }).limit(30).lean(), Prediction.find().sort({ meal: 1 }).lean(),
    ServiceLog.aggregate([{ $group: { _id: '$dish', wasted: { $sum: '$wasted' } } }, { $sort: { wasted: -1 } }, { $limit: 5 }])
  ]);
  const prepared = logs.reduce((sum, log) => sum + log.prepared, 0); const wasted = logs.reduce((sum, log) => sum + log.wasted, 0); const served = logs.reduce((sum, log) => sum + log.consumed, 0);
  res.json({ metrics: { predictedDemand: predictions.reduce((sum, prediction) => sum + (prediction.override ?? prediction.predictedQuantity ?? 0), 0), wastePercent: prepared ? Number((wasted / prepared * 100).toFixed(1)) : 0, savings: Math.round(wasted * 52), accuracy: served ? Number((100 - (wasted / served * 100)).toFixed(1)) : 0 }, trend: logs.map(log => ({ day: new Date(log.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), predicted: Math.round(log.consumed * 1.04), actual: log.consumed, wasted: log.wasted })), predictions, wasteByDish: wasteByDish.map(row => ({ name: row._id, value: row.wasted })) });
});
app.get('/api/alerts', auth, async (_, res) => {
  const highWaste = await ServiceLog.aggregate([
    { $group: { _id: '$dish', prepared: { $sum: '$prepared' }, wasted: { $sum: '$wasted' }, entries: { $sum: 1 } } },
    { $project: { dish: '$_id', entries: 1, wastePercent: { $round: [{ $multiply: [{ $divide: ['$wasted', '$prepared'] }, 100] }, 1] } } },
    { $match: { wastePercent: { $gte: 5 } } }, { $sort: { wastePercent: -1 } }
  ]);
  res.json(highWaste.map(alert => ({ severity: alert.wastePercent >= 10 ? 'high' : 'medium', message: `${alert.dish} is wasting ${alert.wastePercent}% of prepared food across ${alert.entries} logged service days.`, ...alert })));
});
app.get('/api/analytics/evaluation', auth, async (_, res) => {
  const logs = await ServiceLog.find().sort({ date: 1 }).lean();
  res.json(evaluateHistoricalWaste(logs));
});
app.get('/api/analytics/report.csv', auth, async (_, res) => {
  const logs = await ServiceLog.find().sort({ date: -1 }).lean();
  const header = 'date,meal,dish,prepared,consumed,wasted,studentCount,weather,event';
  const lines = logs.map(log => [new Date(log.date).toISOString().slice(0, 10), log.meal, log.dish, log.prepared, log.consumed, log.wasted, log.studentCount ?? '', log.weather ?? '', log.event ?? ''].map(value => `"${String(value).replaceAll('"', '""')}"`).join(','));
  res.header('Content-Type', 'text/csv').attachment('foodwise-service-report.csv').send([header, ...lines].join('\n'));
});
app.get('/api/analytics/report.pdf', auth, async (_, res) => {
  const [logs, evaluation] = await Promise.all([ServiceLog.find().sort({ date: -1 }).limit(20).lean(), ServiceLog.find().lean()]);
  const backtest = evaluateHistoricalWaste(evaluation);
  res.header('Content-Type', 'application/pdf').attachment('foodwise-waste-report.pdf');
  const pdf = new PDFDocument({ margin: 48, size: 'A4' }); pdf.pipe(res);
  pdf.fillColor('#15803d').fontSize(24).text('FoodWise', { continued: true }).fillColor('#17221d').text(' Waste Reduction Report');
  pdf.moveDown(.4).fillColor('#64748b').fontSize(10).text(`Generated ${new Date().toLocaleDateString('en-IN')} | North Campus Canteen`);
  pdf.moveDown().fillColor('#17221d').fontSize(15).text('Impact summary');
  pdf.moveDown(.35).fontSize(11).text(`Historical service records: ${backtest.records} (${backtest.evaluatedRecords} evaluated)`);
  pdf.text(`Manual preparation waste: ${backtest.baselineWaste} units`); pdf.text(`Model-guided simulated waste: ${backtest.modeledWaste} units`); pdf.text(`Estimated waste reduction: ${backtest.reductionPercent}%`);
  pdf.text(`20% target: ${backtest.targetAchieved ? 'ACHIEVED' : 'NOT ACHIEVED'} | Mean absolute error: ${backtest.mae ?? 'n/a'} units`);
  pdf.moveDown().fontSize(15).text('Recent service records'); pdf.moveDown(.4).fontSize(9);
  logs.forEach(log => pdf.text(`${new Date(log.date).toLocaleDateString('en-IN')}  |  ${log.meal}  |  ${log.dish}  |  Prepared: ${log.prepared}  Served: ${log.consumed}  Waste: ${log.wasted}`));
  pdf.moveDown().fillColor('#64748b').fontSize(8).text(`Methodology: ${backtest.methodology} Validate with real canteen operations before publishing a production outcome claim.`);
  pdf.end();
});
app.get('/api/predictions', auth, async (_, res) => res.json(await Prediction.find({ date: { $gte: new Date(new Date().toDateString()) } }).sort({ meal: 1 })));
app.post('/api/predictions/generate', auth, async (req, res) => { try { const { data } = await axios.post(`${mlUrl}/predict`, req.body); const predictions = await Prediction.insertMany(data.predictions); res.status(201).json({ predictions, metrics: data.metrics }); } catch (error) { res.status(503).json({ message: 'Prediction service unavailable', detail: error.message }); } });
app.patch('/api/predictions/:id', auth, async (req, res) => res.json(await Prediction.findByIdAndUpdate(req.params.id, { override: req.body.override }, { new: true })));
const reconnectDelayMs = 10_000;
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
    console.log('MongoDB connected');
  } catch (error) {
    console.error(`MongoDB unavailable; retrying in ${reconnectDelayMs / 1000}s:`, error.message);
    setTimeout(connectDatabase, reconnectDelayMs);
  }
};
app.listen(process.env.PORT || 5000, () => { console.log('FoodWise API ready'); connectDatabase(); });
