import axios from "axios";
import FormData from "form-data";
import { redis } from "../config/redis";

const BASE = "https://notify.eskiz.uz/api";
const TOKEN_KEY = "eskiz:token";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, ""); // 998901234567
}

function buildOtpText(code: string) {
  const tpl = process.env.OTP_SMS_TEXT || "Sizning tasdiqlash kodingiz: {{code}}";
  // IMPORTANT: template must be approved in Eskiz cabinet
  return tpl.replace("{{code}}", code);
}

async function eskizLogin(): Promise<string> {
  const email = process.env.ESKIZ_EMAIL;
  const secret = process.env.ESKIZ_SECRET;

  if (!email || !secret) {
    throw new Error("ESKIZ_EMAIL / ESKIZ_SECRET missing in .env");
  }

  const form = new FormData();
  form.append("email", email);
  form.append("password", secret);

  const { data } = await axios.post(`${BASE}/auth/login`, form, {
    headers: form.getHeaders(),
    timeout: 15000,
  });

  const token = data?.data?.token;
  if (!token) throw new Error("Eskiz token not found in response");

  await redis.set(TOKEN_KEY, token, { EX: 24 * 60 * 60 });
  return token;
}

async function getToken() {
  const cached = await redis.get(TOKEN_KEY);
  if (cached) return cached;
  return eskizLogin();
}

export async function sendSmsEskiz(phone: string, message: string) {
  const to = normalizePhone(phone);
  const from = process.env.ESKIZ_FROM || "4546";
  let token = await getToken();

  const form = new FormData();
  form.append("mobile_phone", to);
  form.append("message", message);
  form.append("from", from);

  try {
    const { data } = await axios.post(`${BASE}/message/sms/send`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
      timeout: 15000,
    });
    return data;
  } catch (err: any) {
    const status = err?.response?.status;
    const msg = String(err?.response?.data?.message || "").toLowerCase();

    // token expired -> relogin and retry once
    if (status === 401 || (msg.includes("token") && msg.includes("expired"))) {
      await redis.del(TOKEN_KEY);
      token = await eskizLogin();

      const { data } = await axios.post(`${BASE}/message/sms/send`, form, {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
        timeout: 15000,
      });
      return data;
    }

    throw err;
  }
}

// helper specifically for OTP (so controller stays clean)
export async function sendOtpSms(phone: string, code: string) {
  const text = buildOtpText(code);
  return sendSmsEskiz(phone, text);
}
