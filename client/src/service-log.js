export function calculateWaste(prepared, consumed) {
  const preparedQuantity = Number(prepared);
  const servedQuantity = Number(consumed);

  if (!Number.isFinite(preparedQuantity) || !Number.isFinite(servedQuantity)) return 0;
  return Math.max(0, preparedQuantity - servedQuantity);
}
