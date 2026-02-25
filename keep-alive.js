// keep-alive.js — ping your Render/Railway URL every 5 min to prevent sleep
import https from "https";
import http from "http";

const SELF_URL = process.env.SELF_URL || "";

if (SELF_URL) {
  const client = SELF_URL.startsWith("https") ? https : http;
  setInterval(() => {
    client.get(SELF_URL + "/health", (res) => {
      console.log(`[keep-alive] ping → ${res.statusCode}`);
    }).on("error", (e) => {
      console.error("[keep-alive] error:", e.message);
    });
  }, 5 * 60 * 1000);
  console.log(`[keep-alive] started → ${SELF_URL}`);
} else {
  console.log("[keep-alive] SELF_URL not set, skipping.");
}
