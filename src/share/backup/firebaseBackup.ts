import { collection, getDocs } from "firebase/firestore";
import dayjs from "dayjs";
import { db } from "store/api";

const BACKUP_COLLECTIONS = [
  "habit",
  "habitsCategories",
  "aim",
  "aimsCategories",
  "taskGroup",
  "history",
  "dailyReview",
  "english",
  "spheres",
] as const;

export interface FirebaseBackup {
  format: "follow-your-aim-backup-v1";
  exportedAt: string;
  projectId: string;
  collections: Record<string, Record<string, unknown>>;
}

export const buildFirebaseBackup = async (): Promise<FirebaseBackup> => {
  const entries = await Promise.all(
    BACKUP_COLLECTIONS.map(async (collectionName) => {
      const snapshot = await getDocs(collection(db, collectionName));
      return [
        collectionName,
        Object.fromEntries(
          snapshot.docs.map((document) => [document.id, document.data()]),
        ),
      ] as const;
    }),
  );

  return {
    format: "follow-your-aim-backup-v1",
    exportedAt: new Date().toISOString(),
    projectId: "followyouraim-6d36f",
    collections: Object.fromEntries(entries),
  };
};

export const downloadFirebaseBackup = (backup: FirebaseBackup) => {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `follow-your-aim-backup-${dayjs().format("YYYY-MM-DD-HHmm")}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};
