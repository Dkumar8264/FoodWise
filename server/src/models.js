import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  date: { type: Date, required: true }, meal: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
  dish: { type: String, required: true }, prepared: { type: Number, required: true }, consumed: { type: Number, required: true },
  wasted: { type: Number, required: true }, studentCount: Number, weather: String, event: String
}, { timestamps: true });
const predictionSchema = new mongoose.Schema({ date: Date, meal: String, dish: String, predictedQuantity: Number, unit: String, confidence: Number, override: Number, features: Object }, { timestamps: true });
export const ServiceLog = mongoose.model('ServiceLog', serviceSchema);
export const Prediction = mongoose.model('Prediction', predictionSchema);
