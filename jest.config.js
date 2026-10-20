const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");
const createJestConfig = nextJest({
  dir: ".",
});
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>/"],
  // integration suites depend on a local Next.js server and Postgres container
  // which are not available in environments such as Vercel's build stage. The
  // default `npm test` command should therefore ignore them so deployments
  // don't fail with timeouts while still allowing developers to run them
  // locally via `npm run test:integration`.
  testTimeout: 60000,
  testPathIgnorePatterns: ["/tests/integration/"],
});

module.exports = jestConfig;
