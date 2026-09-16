const TARGET_REDUCTION_PERCENT = 20;
const MIN_HISTORY = 7;

/** Walk-forward backtest: every recommendation is based only on earlier records. */
export function evaluateHistoricalWaste(logs) {
  const ordered = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const samples = [];

  ordered.forEach((record, index) => {
    const history = ordered.slice(0, index)
      .filter(item => item.dish === record.dish && item.meal === record.meal)
      .slice(-MIN_HISTORY);
    if (history.length < MIN_HISTORY) return;

    const meanConsumption = history.reduce((total, item) => total + item.consumed, 0) / history.length;
    const studentHistory = history.filter(item => item.studentCount > 0);
    const meanStudents = studentHistory.length
      ? studentHistory.reduce((total, item) => total + item.studentCount, 0) / studentHistory.length
      : null;
    const studentAdjustment = meanStudents && record.studentCount > 0 ? record.studentCount / meanStudents : 1;
    const recommendedQuantity = Math.max(0, Math.round(meanConsumption * studentAdjustment * 1.03));
    const actualWaste = Math.max(0, Number(record.wasted ?? record.prepared - record.consumed));
    const simulatedWaste = Math.max(0, recommendedQuantity - record.consumed);

    samples.push({ date: record.date, dish: record.dish, meal: record.meal, actualPrepared: record.prepared, actualConsumed: record.consumed, actualWaste, recommendedQuantity, simulatedWaste, absoluteError: Math.abs(recommendedQuantity - record.consumed) });
  });

  const baselineWaste = samples.reduce((total, item) => total + item.actualWaste, 0);
  const modeledWaste = samples.reduce((total, item) => total + item.simulatedWaste, 0);
  const reductionPercent = baselineWaste ? Number((((baselineWaste - modeledWaste) / baselineWaste) * 100).toFixed(1)) : 0;
  const mae = samples.length ? Number((samples.reduce((total, item) => total + item.absoluteError, 0) / samples.length).toFixed(1)) : null;

  return {
    records: ordered.length, evaluatedRecords: samples.length, excludedRecords: ordered.length - samples.length,
    baselineWaste, modeledWaste, reductionPercent, target: TARGET_REDUCTION_PERCENT,
    targetAchieved: samples.length > 0 && reductionPercent >= TARGET_REDUCTION_PERCENT, mae,
    methodology: `Walk-forward backtest: each recommendation uses the prior ${MIN_HISTORY} matching dish-and-meal consumption records, adjusted for student count, with a 3% service buffer. The first ${MIN_HISTORY} matching records are excluded because no prior history is available.`,
    samples
  };
}
