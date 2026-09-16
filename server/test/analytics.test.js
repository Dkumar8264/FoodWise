import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateHistoricalWaste } from '../src/analytics.js';

const record = (day, { consumed = 100, prepared = 120, wasted = prepared - consumed, studentCount = 100 } = {}) => ({
  date: new Date(`2026-01-${String(day).padStart(2, '0')}T00:00:00.000Z`),
  dish: 'Vegetable pulao', meal: 'Lunch', consumed, prepared, wasted, studentCount
});

test('walk-forward evaluation excludes warm-up records and measures modeled waste', () => {
  const logs = Array.from({ length: 7 }, (_, index) => record(index + 1));
  logs.push(record(8));
  logs.push(record(9, { consumed: 110, prepared: 140, wasted: 30 }));

  const result = evaluateHistoricalWaste(logs);

  assert.equal(result.records, 9);
  assert.equal(result.evaluatedRecords, 2);
  assert.equal(result.excludedRecords, 7);
  assert.equal(result.baselineWaste, 50);
  assert.equal(result.modeledWaste, 3);
  assert.equal(result.reductionPercent, 94);
  assert.equal(result.targetAchieved, true);
  assert.equal(result.samples[0].recommendedQuantity, 103);
});

test('walk-forward evaluation does not claim a target without sufficient history', () => {
  const result = evaluateHistoricalWaste([record(1), record(2)]);

  assert.equal(result.evaluatedRecords, 0);
  assert.equal(result.targetAchieved, false);
  assert.equal(result.mae, null);
});
