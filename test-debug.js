console.log("🔍 STEP 1: loading node:http...");
require("node:http");
console.log("✅ STEP 1: OK");

console.log("🔍 STEP 2: loading socket.io...");
require("socket.io");
console.log("✅ STEP 2: OK");

console.log("🔍 STEP 3: loading @libsql/client...");
const { createClient } = require("@libsql/client");
console.log("✅ STEP 3: OK");

console.log("🔍 STEP 4: createClient file:./data/simulator.db...");
const client = createClient({ url: "file:./data/simulator.db" });
console.log("✅ STEP 4: OK");

console.log("🔍 STEP 5: executing sqlite query...");
client.execute("SELECT 1;").then((res) => {
  console.log("✅ STEP 5: OK -> SQLite query success:", res.rows);

  console.log("🔍 STEP 6: loading next...");
  const next = require("next");
  console.log("✅ STEP 6: OK");

  console.log("🔍 STEP 7: loading compiled config from .next/required-server-files.json...");
  const path = require("path");
  const serverFiles = require(path.join(process.cwd(), ".next/required-server-files.json"));
  const conf = serverFiles.config;
  console.log("✅ STEP 7: Config loaded OK");

  console.log("🔍 STEP 8: loading NextNodeServer class...");
  const NextNodeServer = require("next/dist/server/next-server").default;
  console.log("✅ STEP 8: NextNodeServer class loaded OK");

  console.log("🔍 STEP 9: instantiating NextNodeServer...");
  const nextServer = new NextNodeServer({
    dir: process.cwd(),
    conf,
    dev: false,
    minimalMode: false,
    hostname: "0.0.0.0",
    port: 3000,
  });
  console.log("✅ STEP 9: NextNodeServer instantiated OK");

  console.log("🔍 STEP 10: nextServer.prepare()...");
  nextServer.prepare().then(async () => {
    console.log("✅ STEP 10: nextServer.prepare() OK");

    console.log("🔍 STEP 11: getting request handler...");
    const handle = nextServer.getRequestHandler();
    console.log("✅ STEP 11: getRequestHandler OK -> handler type:", typeof handle);

    console.log("\n🎉 ALL 11 STEPS PASSED 100%! Ready to run in production!");
    process.exit(0);
  }).catch((err) => {
    console.error("❌ ERROR in nextServer.prepare():", err);
    process.exit(1);
  });
}).catch((err) => {
  console.error("❌ STEP 5 ERROR in client.execute():", err);
  process.exit(1);
});
