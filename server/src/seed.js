import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MenuDish, Prediction, ServiceLog, User } from './models.js';

const atlasDnsServers = process.env.ATLAS_DNS_SERVERS?.split(',').map(server => server.trim()).filter(Boolean);
if (atlasDnsServers?.length) dns.setServers(atlasDnsServers);

const dishes = [
  { name: 'Masala dosa', meal: 'Breakfast', unit: 'plates' }, { name: 'Vegetable pulao', meal: 'Lunch', unit: 'plates' },
  { name: 'Rajma chawal', meal: 'Lunch', unit: 'plates' }, { name: 'Paneer curry', meal: 'Dinner', unit: 'kg' }, { name: 'Chapati', meal: 'Dinner', unit: 'pieces' }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await bcrypt.hash('foodwise123', 12);
  await User.updateOne({ email: 'admin@foodwise.in' }, { $setOnInsert: { name: 'Arjun Kapoor', email: 'admin@foodwise.in', passwordHash, role: 'admin' } }, { upsert: true });
  await Promise.all(dishes.map(dish => MenuDish.updateOne({ name: dish.name, meal: dish.meal }, { $setOnInsert: dish }, { upsert: true })));
  if (await ServiceLog.countDocuments() === 0) {
    const start = new Date('2026-08-18T00:00:00.000Z');
    const logs = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(start); date.setDate(start.getDate() + index);
      const busy = [1, 2, 3].includes(date.getDay()); const consumed = 330 + (index % 6) * 13 + (busy ? 45 : 0); const prepared = consumed + 18 + (index % 5) * 4;
      return { date, meal: 'Lunch', dish: 'Vegetable pulao', prepared, consumed, wasted: prepared - consumed, studentCount: busy ? 1240 : 1020, weather: index % 4 === 0 ? 'Rain' : 'Clear', event: index === 28 ? 'Cultural Fest' : 'None' };
    });
    await ServiceLog.insertMany(logs);
  }
  if (await Prediction.countDocuments() === 0) await Prediction.insertMany(dishes.map((dish, index) => ({ date: new Date('2026-09-17T00:00:00.000Z'), meal: dish.meal, dish: dish.name, predictedQuantity: [120,180,145,92,340][index], unit: dish.unit, confidence: [91,96,94,88,93][index], features: { studentCount: 1240, event: 'Cultural Fest' } })));
  console.log('FoodWise seed complete');
  await mongoose.disconnect();
}
seed().catch(error => { console.error('Seed failed:', error.message); process.exit(1); });
