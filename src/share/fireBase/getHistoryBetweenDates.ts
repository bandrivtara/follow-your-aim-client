import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { generateMonthYearArray } from "share/functions/generateMonthYearArray";
import { db } from "store/api";

export const getHistoryBetweenDates = async (
  dateFrom: string,
  dateTo: string
) => {
  const historyCollection = collection(db, "history");
  const dates = generateMonthYearArray(dateFrom, dateTo);
  const q = query(historyCollection, where(documentId(), "in", dates));
  const querySnapshot = await getDocs(q);

  return querySnapshot;
};
