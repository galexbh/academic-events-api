import mongoose from "mongoose";
import config from "config";
import log from "./logger";

async function connect() {
  const dbUri = config.get<string>("dbUri");
  try {
    await mongoose.connect(dbUri);
    log.info("DB connected");
  } catch (err) {
    log.error("could not connect to db");
    process.exit(1);
  }
}

export async function disconnect() {
  await mongoose.connection.close();

  log.info("Disconnect from DB");

  return;
}

export default connect;
