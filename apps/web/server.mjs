import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const host = "0.0.0.0";
const railwayPort = Number(process.env.PORT || 3000);
const ports = [...new Set([railwayPort, 3000])].filter((p) => Number.isFinite(p) && p > 0);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function sendFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function handler(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: true,
      service: "hologram-web",
      version: "0.2.2",
      port: req.socket.localPort,
      time: new Date().toISOString()
    }));
    return;
  }

  let requestPath = decodeURIComponent(url.pathname);
  if (requestPath === "/") requestPath = "/index.html";

  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(distDir, safePath);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(res, filePath);
      return;
    }

    sendFile(res, path.join(distDir, "index.html"));
  });
}

if (!fs.existsSync(path.join(distDir, "index.html"))) {
  console.error(`[hologram-web] build output missing: ${path.join(distDir, "index.html")}`);
}

for (const port of ports) {
  const server = http.createServer(handler);
  server.on("error", (error) => {
    if (error?.code === "EADDRINUSE" && port !== railwayPort) {
      console.warn(`[hologram-web] fallback port ${port} already in use; continuing on ${railwayPort}`);
      return;
    }
    console.error(`[hologram-web] server error on port ${port}`, error);
    process.exit(1);
  });
  server.listen(port, host, () => {
    console.log(`[hologram-web] listening on http://${host}:${port}`);
    console.log(`[hologram-web] serving ${distDir}`);
  });
}
