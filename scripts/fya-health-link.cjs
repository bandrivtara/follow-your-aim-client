const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const localConfigPath = path.join(root, ".codex-local", "health-link.json");

const readConfig = () => {
  if (process.env.HEALTH_PROJECT_DIR) {
    return { healthProjectDir: process.env.HEALTH_PROJECT_DIR, source: "HEALTH_PROJECT_DIR" };
  }
  if (!fs.existsSync(localConfigPath)) {
    throw new Error(
      "Health не підключено. Створи .codex-local/health-link.json за прикладом у docs/codex/nutrition-workflow.md.",
    );
  }
  return {
    ...JSON.parse(fs.readFileSync(localConfigPath, "utf8")),
    source: path.relative(root, localConfigPath),
  };
};

const validatePlan = (filePath) => {
  const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const errors = [];
  if (!["fya-nutrition-v1", "fya-nutrition-v2"].includes(value.schemaVersion)) {
    errors.push("невідома schemaVersion");
  }
  if (!value.settings || !Number.isFinite(Number(value.settings.calorieTarget))) {
    errors.push("немає settings.calorieTarget");
  }
  if (!value.plan || !Array.isArray(value.plan.days) || !Array.isArray(value.plan.recipes)) {
    errors.push("немає plan.days або plan.recipes");
  }
  if (value.schemaVersion === "fya-nutrition-v2") {
    const meals = (value.plan?.days || []).flatMap((day) => day.meals || []);
    if (meals.some((meal) => !meal.portionDescription)) {
      errors.push("не всі прийоми мають portionDescription");
    }
  }
  return {
    file: path.basename(filePath),
    weekStart: value.plan?.weekStart || null,
    weekEnd: value.plan?.weekEnd || null,
    status: value.status || null,
    valid: errors.length === 0,
    errors,
  };
};

const config = readConfig();
const healthDir = path.resolve(config.healthProjectDir);
const required = [
  "AGENTS.md",
  "00_PROFILE.md",
  path.join("nutrition", "planning-protocol.md"),
  path.join("integration", "README.md"),
];
const missing = required.filter((item) => !fs.existsSync(path.join(healthDir, item)));
if (missing.length) {
  throw new Error(`Вказана папка не схожа на Health. Немає: ${missing.join(", ")}`);
}

const integrationDir = path.join(healthDir, "integration");
const plans = fs.readdirSync(integrationDir)
  .filter((name) => /^fya-nutrition-\d{4}-\d{2}-\d{2}\.json$/.test(name))
  .map((name) => validatePlan(path.join(integrationDir, name)))
  .sort((a, b) => String(b.weekStart).localeCompare(String(a.weekStart)));

const result = {
  connected: true,
  source: config.source,
  healthProjectDir: healthDir,
  plans,
  validPlans: plans.filter((plan) => plan.valid).length,
};

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  console.log(`Health підключено: ${healthDir}`);
  console.log(`Знайдено планів: ${plans.length}; валідних: ${result.validPlans}`);
  plans.forEach((plan) => {
    console.log(`${plan.valid ? "✓" : "✗"} ${plan.file} · ${plan.weekStart || "?"} — ${plan.weekEnd || "?"}${plan.errors.length ? ` · ${plan.errors.join("; ")}` : ""}`);
  });
}

