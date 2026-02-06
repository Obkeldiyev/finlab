import crypto from "crypto";
import { redis } from "../config/redis";

const TTL = Number(process.env.OTP_TTL_SECONDS || 300);

function key(purpose: "register" | "login", phone: string) {
  const p = phone.replace(/[^\d]/g, "");
  return `otp:${purpose}:${p}`;
}

export function genOtp() {
  return crypto.randomInt(0, 100_000).toString().padStart(5, "0");
}

export async function saveOtp(purpose: "register" | "login", phone: string, code: string) {
  await redis.set(key(purpose, phone), code, { EX: TTL });
}

export async function verifyOtp(purpose: "register" | "login", phone: string, code: string) {
  const saved = await redis.get(key(purpose, phone));
  if (!saved) return false;
  if (saved !== code) return false;

  await redis.del(key(purpose, phone));
  return true;
}

export async function checkOtp(purpose: "register" | "login", phone: string, code: string) {
  const saved = await redis.get(key(purpose, phone));
  if (!saved) return false;
  if (saved !== code) return false;
  // Don't delete - just verify
  return true;
}
