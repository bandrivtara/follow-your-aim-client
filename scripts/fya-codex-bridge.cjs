const fs = require("node:fs/promises");
const path = require("node:path");
const { initializeApp, deleteApp } = require("firebase/app");
const {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  writeBatch,
} = require("firebase/firestore");
const {
  addDays,
  createMonthPatches,
  formatDate,
  parseDate,
  validatePlanDocument,
} = require("./fya-plan-core.cjs");
const {
  createHabitMetadataPreview,
} = require("./fya-habit-metadata-core.cjs");

const firebaseConfig = {
  apiKey: "AIzaSyAQT-N1MJQTTjk1aqoXK9ijOkZ1vSqkiyI",
  authDomain: "followyouraim-6d36f.firebaseapp.com",
  projectId: "followyouraim-6d36f",
  storageBucket: "followyouraim-6d36f.appspot.com",
  messagingSenderId: "814413425994",
  appId: "1:814413425994:web:00d57fced0f0ad8afee5b3",
  measurementId: "G-YH0SG39DQR",
};

const args = process.argv.slice(2);
const command = args[0];
const getOption = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const hasFlag = (name) => args.includes(name);

const getMonthIds = (dateFrom, dateTo) => {
  const result = [];
  let cursor = new Date(Date.UTC(dateFrom.getUTCFullYear(), dateFrom.getUTCMonth(), 1));
  const end = new Date(Date.UTC(dateTo.getUTCFullYear(), dateTo.getUTCMonth(), 1));
  while (cursor <= end) {
    result.push(cursor.toISOString().slice(0, 7));
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return result;
};

const readCollection = async (db, name) => {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

const readMonthDocuments = async (db, collectionName, monthIds) => {
  const values = await Promise.all(
    monthIds.map(async (monthId) => {
      const snapshot = await getDoc(doc(db, collectionName, monthId));
      return snapshot.exists() ? { id: monthId, ...snapshot.data() } : null;
    }),
  );
  return values.filter(Boolean);
};

const exportContext = async (db) => {
  const weekValue = getOption("--week");
  const targetFrom = parseDate(weekValue, "--week");
  if (targetFrom.getUTCDay() !== 1) throw new Error("--week must be a Monday");
  const targetTo = addDays(targetFrom, 6);
  const contextFrom = addDays(targetFrom, -28);
  const monthIds = getMonthIds(contextFrom, targetTo);
  const [habits, habitCategories, taskGroups, aims, history, dailyReviews] =
    await Promise.all([
    readCollection(db, "habit"),
    readCollection(db, "habitsCategories"),
    readCollection(db, "taskGroup"),
    readCollection(db, "aim"),
    readMonthDocuments(db, "history", monthIds),
    readMonthDocuments(db, "dailyReview", monthIds),
    ]);
  const bundle = {
    version: "fya-context-v1",
    generatedAt: new Date().toISOString(),
    targetWeek: { from: formatDate(targetFrom), to: formatDate(targetTo) },
    contextRange: { from: formatDate(contextFrom), to: formatDate(addDays(targetFrom, -1)) },
    habits,
    habitCategories,
    taskGroups,
    aims,
    history,
    dailyReviews,
  };
  const outputPath = path.resolve(
    getOption("--out") || ".codex-local/fya-context.json",
  );
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  console.log(`Context exported read-only to ${outputPath}`);
  console.log(`Target week: ${bundle.targetWeek.from} — ${bundle.targetWeek.to}`);
  console.log(`Definitions: ${habits.length} habits, ${taskGroups.length} task groups, ${aims.length} aims`);
};

const applyPlan = async (db) => {
  const filePath = getOption("--file");
  if (!filePath) throw new Error("apply-plan requires --file");
  const plan = JSON.parse(await fs.readFile(path.resolve(filePath), "utf8"));
  const { weekFrom, weekTo } = validatePlanDocument(plan);
  const [habits, taskGroups] = await Promise.all([
    readCollection(db, "habit"),
    readCollection(db, "taskGroup"),
  ]);
  const definitions = new Map(
    [...habits, ...taskGroups].map((activity) => [activity.id, activity]),
  );
  const monthIds = getMonthIds(weekFrom, weekTo);
  const historyDocuments = await readMonthDocuments(db, "history", monthIds);
  const historyByMonth = Object.fromEntries(
    historyDocuments.map(({ id, ...data }) => [id, data]),
  );
  const { patches, preview } = createMonthPatches(
    plan,
    definitions,
    historyByMonth,
  );

  console.log("\nFYA planning preview (Big 3 is not written):");
  plan.big3.forEach((item, index) => console.log(`  ${index + 1}. ${item}`));
  if (!preview.length) console.log("  No tracker changes requested.");
  preview.forEach((item) =>
    console.log(`  ${item.date} | ${item.action.padEnd(6)} | ${item.title} (${item.activityId})`),
  );

  if (!hasFlag("--apply")) {
    console.log("\nDry-run only. Re-run with --apply after explicit user confirmation.");
    return;
  }
  const batch = writeBatch(db);
  Object.entries(patches).forEach(([monthId, patch]) => {
    batch.set(doc(db, "history", monthId), patch, { merge: true });
  });
  await batch.commit();

  const verification = await readMonthDocuments(db, "history", Object.keys(patches));
  const verified = preview.every((item) => {
    const month = verification.find((value) => value.id === item.date.slice(0, 7));
    return Boolean(month?.[item.date.slice(8, 10)]?.[item.activityId]);
  });
  if (!verified) throw new Error("Write completed but read-back verification failed");
  console.log(`\nApplied and verified ${preview.length} planning changes.`);
};

const applyHabitMetadata = async (db) => {
  const filePath = getOption("--file");
  if (!filePath) throw new Error("apply-habit-metadata requires --file");
  const metadata = JSON.parse(
    await fs.readFile(path.resolve(filePath), "utf8"),
  );
  const habits = await readCollection(db, "habit");
  const preview = createHabitMetadataPreview(metadata, habits);

  console.log("\nFYA habit metadata preview:");
  preview.forEach((item) =>
    console.log(
      `  ${item.title} (${item.habitId}) | ${item.from.lifeArea || "—"} → ${item.to.lifeArea} | complexity ${item.from.complexity ?? "—"} → ${item.to.complexity}`,
    ),
  );

  if (!hasFlag("--apply")) {
    console.log(
      "\nDry-run only. Re-run with --apply after explicit user confirmation.",
    );
    return;
  }

  const batch = writeBatch(db);
  preview.forEach((item) => {
    batch.update(doc(db, "habit", item.habitId), item.to);
  });
  await batch.commit();

  const verification = await readCollection(db, "habit");
  const verified = preview.every((item) => {
    const habit = verification.find((value) => value.id === item.habitId);
    return (
      habit?.lifeArea === item.to.lifeArea &&
      habit?.complexity === item.to.complexity
    );
  });
  if (!verified) {
    throw new Error("Write completed but habit metadata verification failed");
  }
  console.log(`\nApplied and verified ${preview.length} habit metadata changes.`);
};

const printHelp = () => {
  console.log(`Follow Your Aim Codex bridge

Commands:
  export-context --week YYYY-MM-DD [--out file]
  apply-plan --file plan.json [--apply]
  apply-habit-metadata --file metadata.json [--apply]

Write commands are dry-runs unless --apply is present.`);
};

const main = async () => {
  if (!command || command === "help" || hasFlag("--help")) {
    printHelp();
    return;
  }
  const app = initializeApp(firebaseConfig, `fya-codex-bridge-${Date.now()}`);
  const db = getFirestore(app);
  try {
    if (command === "export-context") await exportContext(db);
    else if (command === "apply-plan") await applyPlan(db);
    else if (command === "apply-habit-metadata") await applyHabitMetadata(db);
    else throw new Error(`Unknown command: ${command}`);
  } finally {
    await deleteApp(app);
  }
};

main().catch((error) => {
  console.error(`FYA bridge error: ${error.message}`);
  process.exitCode = 1;
});
