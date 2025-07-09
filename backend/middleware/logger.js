// middleware/logger.js
import { getAccessToken } from '../utils/auth.js';
import fetch from 'node-fetch';

let token = null;

export async function log(stack, level, pkg, message) {
  // Validate inputs
  const isValidStack = ["backend", "frontend"].includes(stack);
  const isValidLevel = ["debug", "info", "warn", "error", "fatal"].includes(level);
  const backendPackages = [
    "cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"
  ];
  const frontendPackages = [
    "api", "component", "hook", "page", "state", "style"
  ];
  const commonPackages = ["auth", "config", "middleware", "utils"];
  const isValidPackage =
    (stack === "backend" && (backendPackages.includes(pkg) || commonPackages.includes(pkg))) ||
    (stack === "frontend" && (frontendPackages.includes(pkg) || commonPackages.includes(pkg)));

  if (!isValidStack || !isValidLevel || !isValidPackage) {
    console.warn("🚨 Invalid log:", { stack, level, pkg, message });
    return;
  }

  // Get access token (mocked)
  if (!token) {
    try {
      token = await getAccessToken();
    } catch (err) {
      console.warn("⚠️ Failed to get access token, using mock logs");
      token = "mock-access-token";
    }
  }

  // Try real logging, fallback to console log if it fails
  try {
    const res = await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ stack, level, package: pkg, message })
    });

    const data = await res.json();

    if (res.ok && data.logID) {
      console.log("✅ Log ID:", data.logID);
    } else {
      console.warn("⚠️ Log sent but no ID returned. Fallback log:", {
        stack, level, pkg, message
      });
    }
  } catch (err) {
    console.error("❌ Log API failed. Using fallback logging:");
    console.log(`📝 [${stack}] [${level}] [${pkg}] → ${message}`);
  }
}
