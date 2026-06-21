import app from "./app.js";
import "dotenv/config";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const hasPgConfig = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"].every(
  (varName) => Boolean(process.env[varName])
);
const missingEnvVars = [];

if (!hasDatabaseUrl && !hasPgConfig) {
  missingEnvVars.push("DATABASE_URL or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD");
}

if (!process.env.JWT_SECRET) {
  missingEnvVars.push("JWT_SECRET");
}

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
