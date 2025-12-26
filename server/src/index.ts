import "dotenv/config";
import mongoose from "mongoose";

import { app } from "./app";

async function start() {
  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  const mongoUri = process.env.MONGO_URI ?? process.env.DATABASE_URL;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI (or DATABASE_URL)");
  }

  await mongoose.connect(mongoUri);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
