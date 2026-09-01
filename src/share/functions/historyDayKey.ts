/**
 * Firestore history documents use zero-padded day keys ("01"..."31").
 * Readers still accept legacy unpadded keys, but every new write must use this
 * canonical representation so that a legacy key cannot shadow fresh data.
 */
export const normalizeHistoryDayKey = (day: string | number) =>
  String(Number(day)).padStart(2, "0");
