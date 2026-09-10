import { spawn } from "node:child_process";

const serviceName = (
  process.env.RAILWAY_SERVICE_NAME ||
  process.env.SERVICE_NAME ||
  ""
).toLowerCase();

let workspace = "apps/api";

if (serviceName.includes("web")) {
  workspace = "apps/web";
} else if (serviceName.includes("api")) {
  workspace = "apps/api";
}

console.log(`[railway-start] service=${serviceName || "unknown"} workspace=${workspace}`);

const child = spawn("npm", ["run", "start", "-w", workspace], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32"
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[railway-start] child exited via signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
