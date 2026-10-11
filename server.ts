import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { simulationEngine } from "./src/server/engine";
import { initSocketServer } from "./src/server/socket";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {}
}

const dev = process.env.NODE_ENV === "development";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3030", 10);

async function main() {
  await simulationEngine.init();

  const path = require("node:path");
  const fs = require("node:fs");
  let projectDir = process.cwd();
  if (!fs.existsSync(path.join(projectDir, ".next/required-server-files.json"))) {
    projectDir = path.resolve(__dirname, "..");
  }

  let handle: (req: any, res: any) => Promise<void>;

  if (dev) {
    const app = next({
      dev: true,
      hostname,
      port,
      dir: projectDir,
    });
    await app.prepare();
    handle = app.getRequestHandler();
  } else {
    // Production: Direct NextNodeServer instantiation using pre-compiled build config
    // Completely bypasses loadConfig, transpile-config, and @next/swc native bindings
    // Runs 100% single-threaded with zero worker threads on CloudLinux/cPanel shared hosting
    const NextNodeServer = require("next/dist/server/next-server").default;
    console.log(`📂 Using project directory: ${projectDir}`);
    const serverFiles = require(path.join(projectDir, ".next/required-server-files.json"));
    const conf = serverFiles.config;

    const nextServer = new NextNodeServer({
      dir: projectDir,
      conf,
      dev: false,
      minimalMode: false,
      hostname,
      port,
    });
    await nextServer.prepare();
    handle = nextServer.getRequestHandler();
  }

  const mimeTypes: Record<string, string> = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json",
  };

  const zlibModule = require("node:zlib");

  const serveStaticFile = (req: any, res: any, filePath: string) => {
    try {
      const pathModule = require("node:path");
      const fsModule = require("node:fs");
      const ext = pathModule.extname(filePath);
      const contentType = mimeTypes[ext] || "application/octet-stream";
      const acceptEncoding = (req.headers["accept-encoding"] || "").toString();
      const isCompressible = /\.(js|css|svg|json|html|txt)$/i.test(filePath);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

      if (isCompressible && /\bgzip\b/.test(acceptEncoding)) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Vary", "Accept-Encoding");
        res.writeHead(200);
        const rawStream = fsModule.createReadStream(filePath);
        const gzipStream = zlibModule.createGzip({ level: 6 });
        rawStream.pipe(gzipStream).pipe(res);
      } else {
        const stat = fsModule.statSync(filePath);
        res.setHeader("Content-Length", stat.size);
        res.writeHead(200);
        fsModule.createReadStream(filePath).pipe(res);
      }
    } catch {
      res.writeHead(404);
      res.end();
    }
  };

  const pathModule = require("node:path");
  const fsModule = require("node:fs");

  const compression = require("compression");
  const compressMiddleware = compression({
    threshold: 1024,
  });

  const httpServer = createServer((req, res) => {
    // Anti-SEO: Blokir mutlak pengindeksan oleh search engine (Google, Bing, dll.)
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

    const rawUrl = req.url || "/";
    const cleanUrl = rawUrl.split("?")[0];

    // Static assets from .next/static/
    if (cleanUrl.startsWith("/_next/static/")) {
      const relPath = cleanUrl.replace(/^\/_next\/static\//, "");
      const filePath = pathModule.join(process.cwd(), ".next/static", relPath);
      if (fsModule.existsSync(filePath) && fsModule.statSync(filePath).isFile()) {
        return serveStaticFile(req, res, filePath);
      }
    }

    // Static assets from public/
    const publicPath = pathModule.join(process.cwd(), "public", cleanUrl.replace(/^\//, ""));
    if (cleanUrl !== "/" && fsModule.existsSync(publicPath) && fsModule.statSync(publicPath).isFile()) {
      return serveStaticFile(req, res, publicPath);
    }

    // Socket.io polling request handling bypass
    if (cleanUrl.startsWith("/api/socketio")) {
      return;
    }

    // Dynamic responses: Compress HTML & API JSON with gzip
    compressMiddleware(req, res, () => {
      handle(req, res);
    });
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socketio",
  });

  if (process.env.REDIS_URL) {
    try {
      const { createAdapter } = require("@socket.io/redis-adapter");
      const Redis = require("ioredis");
      const pubClient = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      console.log("⚡ Socket.IO initialized with Redis Pub/Sub adapter for high-concurrency clustering.");
    } catch (redisErr) {
      console.warn("⚠️ Failed to initialize Redis Adapter for Socket.IO (falling back to memory):", redisErr);
    }
  }

  initSocketServer(io, simulationEngine);

  httpServer.listen(port, hostname, () => {
    console.log(`\n======================================================`);
    console.log(`⚡ BID SIMULATOR & CMS CONTROLLER READY`);
    console.log(`🌐 Tampilan Publik  : http://localhost:${port}/`);
    console.log(`🖥️ CMS Controller   : http://localhost:${port}/admin`);
    console.log(`======================================================\n`);
  });
}

main().catch((err) => {
  console.error("❌ Fatal error starting server:", err);
  process.exit(1);
});
