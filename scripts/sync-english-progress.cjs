const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const englishRepositoryPath = process.env.FYA_ENGLISH_REPO_PATH
  ? path.resolve(process.env.FYA_ENGLISH_REPO_PATH)
  : path.resolve(projectRoot, "..", "english-learning");
const vocabularyPath = path.join(
  englishRepositoryPath,
  "vocabulary",
  "vocabulary.json",
);
const outputPath = path.join(
  projectRoot,
  "src",
  "config",
  "englishProgress.generated.json",
);

const learnedStatuses = new Set(["active", "mastered"]);

const readVocabulary = () => {
  const parsed = JSON.parse(fs.readFileSync(vocabularyPath, "utf8"));
  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error("vocabulary.json must contain an items array");
  }
  return parsed.items;
};

try {
  const items = readVocabulary();
  const learnedCount = items.filter((item) =>
    learnedStatuses.has(item?.status),
  ).length;
  const generatedProgress = {
    learnedCount,
    totalTracked: items.length,
    lastUpdated: fs.statSync(vocabularyPath).mtime.toISOString(),
    source: "english-learning/vocabulary/vocabulary.json",
  };

  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(generatedProgress, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `English progress synchronized: ${learnedCount} learned of ${items.length} tracked.`,
  );
} catch (error) {
  if (fs.existsSync(outputPath)) {
    console.warn(
      `English progress sync skipped; keeping the existing snapshot. ${error.message}`,
    );
    process.exit(0);
  }
  console.error(`English progress sync failed. ${error.message}`);
  process.exit(1);
}
