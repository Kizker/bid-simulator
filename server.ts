import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { simulationEngine } from "./src/server/engine";
import { initSocketServer } from "./src/server/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({
  dev,
  hostname,
  port,
  dir: __dirname,
  conf: {
    experimental: { cpus: 1 },
  },
});
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  await simulationEngine.init();

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
});
