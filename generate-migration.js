const { execSync } = require("child_process");

const migrationName = process.argv[2];

if (!migrationName) {
  console.error("❌ Please provide a migration name.\nUsage: yarn migrate <MigrationName>");
  process.exit(1);
}

const migrationDir = "src/database/migrations";

const cmd = `yarn build && ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate ${migrationDir}/${migrationName} -d src/built-in/config/typeorm.config.ts`;

console.log(`🚀 Generating migration: ${migrationName}`);
execSync(cmd, { stdio: "inherit" });
