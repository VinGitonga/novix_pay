import * as dotenv from "dotenv";

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const APP_PORT = "8745";
export const MONGODB_URI = process.env.MONGODB_URI;
