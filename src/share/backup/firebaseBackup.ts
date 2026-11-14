import { collection, getDocs } from "firebase/firestore";
import { db } from "store/api";

const BACKUP_COLLECTIONS = [
  "habit",
  "habitsCategories",
  "taskGroup",
  "aim",
  "aimsCategories",
  "spheres",
  "history",
  "dailyReview",
  "english",
  "nutritionSettings",
  "nutritionPlan",
  "nutritionDay",
] as const;

export const buildFirebaseBackup = async () => {
  const entries = await Promise.all(
    BACKUP_COLLECTIONS.map(async (collectionName) => {
      const snapshot = await getDocs(collection(db, collectionName));
      return [
        collectionName,
        snapshot.docs.map((item) => ({ id: item.id, data: item.data() })),
      ] as const;
    }),
  );

  return {
    schemaVersion: "follow-your-aim-backup-v1",
    exportedAt: new Date().toISOString(),
    collections: Object.fromEntries(entries),
  };
};

export const downloadFirebaseBackup = (backup: unknown) => {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `follow-your-aim-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
