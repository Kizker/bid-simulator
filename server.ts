import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { simulationEngine } from "./src/server/engine";
import { initSocketServer } from "./src/server/socket";

const dev = process.env.NODE_ENV === "development";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3030", 10);

async function main() {
  await simulationEngine.init();

  let handle: (req: any, res: any) => Promise<void>;

  if (dev) {
    const app = next({
      dev: true,
      hostname,
      port,
      dir: process.cwd(),
    });
    await app.prepare();
    handle = app.getRequestHandler();
  } else {
    // Production: Direct NextNodeServer instantiation using pre-compiled build config
    // Completely bypasses loadConfig, transpile-config, and @next/swc native bindings
    // Runs 100% single-threaded with zero worker threads on CloudLinux/cPanel shared hosting
    const path = require("node:path");
    const fs = require("node:fs");
    const NextNodeServer = require("next/dist/server/next-server").default;
    let projectDir = process.cwd();
    if (!fs.existsSync(path.join(projectDir, ".next/required-server-files.json"))) {
      projectDir = path.resolve(__dirname, "..");
    }
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

  const httpServer = createServer((req, res) => {
    // Anti-SEO: Blokir mutlak pengindeksan oleh search engine (Google, Bing, dll.)
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socketio",
  });

  initSocketServer(io, simulationEngine);

  httpServer.listen(port, hostname, () => {
    console.log(`\n======================================================`);
    console.log(`⚡ BID SIMULATOR & CMS CONTROLLER READY`);
    console.log(`📱 Mobile Simulator : http://localhost:${port}/simulator`);
    console.log(`🖥️ CMS Controller   : http://localhost:${port}/admin`);
    console.log(`======================================================\n`);
  });
}

main().catch((err) => {
  console.error("❌ Fatal error starting server:", err);
  process.exit(1);
});
