import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { simulationEngine } from "./src/server/engine";
import { initSocketServer } from "./src/server/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

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
    // Production: Direct NextNodeServer instantiation to run single-threaded
    // Eliminates worker threads & child_process fork that trigger SIGABRT on CloudLinux/cPanel shared hosting
    const NextNodeServer = require("next/dist/server/next-server").default;
    const loadConfig = require("next/dist/server/config").default;
    const { PHASE_PRODUCTION_SERVER } = require("next/dist/shared/lib/constants");

    const projectDir = process.cwd();
    const conf = await loadConfig(PHASE_PRODUCTION_SERVER, projectDir, { silent: true });
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

  httpServer.listen(port, () => {
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
