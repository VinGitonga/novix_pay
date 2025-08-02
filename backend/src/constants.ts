import * as dotenv from "dotenv";

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const APP_PORT = "8745";
export const MONGODB_URI = process.env.MONGODB_URI;
export const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
export const THIRDWEB_SERVER_ADDRESS = process.env.THIRDWEB_SERVER_ADDRESS;
export const CONTRACT_ADDRESS = "0x33763D18a61f846F90aE610d6B699cd309dAc31E";
export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
export const API_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:8745/api" : "https://novix_pay_api.vingitonga.xyz/api";
export const FACILITATOR_URL = process.env.NODE_ENV === "development" ? "http://localhost:6099" : "https://novix_pay_api_facilitator.vingitonga.xyz";
export const CLIENT_URL = process.env.NODE_ENV === "development" ? "http://localhost:5173" : "https://novix_pay.vingitonga.xyz";
