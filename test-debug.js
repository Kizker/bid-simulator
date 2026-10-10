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

  console.log("🔍 STEP 7: loading NextNodeServer & config...");
  const NextNodeServer = require("next/dist/server/next-server").default;
  const loadConfig = require("next/dist/server/config").default;
  const { PHASE_PRODUCTION_SERVER } = require("next/dist/shared/lib/constants");

  loadConfig(PHASE_PRODUCTION_SERVER, process.cwd(), { silent: true }).then(async (conf) => {
    console.log("✅ STEP 7: Config loaded OK");

    console.log("🔍 STEP 8: instantiating NextNodeServer...");
    const nextServer = new NextNodeServer({
      dir: process.cwd(),
      conf,
      dev: false,
      minimalMode: false,
      hostname: "0.0.0.0",
      port: 3000,
    });
    console.log("✅ STEP 8: NextNodeServer instantiated OK");

    console.log("🔍 STEP 9: nextServer.prepare()...");
    await nextServer.prepare();
    console.log("✅ STEP 9: nextServer.prepare() OK");

    console.log("🔍 STEP 10: getting request handler...");
    const handle = nextServer.getRequestHandler();
    console.log("✅ STEP 10: getRequestHandler OK -> handler type:", typeof handle);

    console.log("\n🎉 ALL 10 STEPS PASSED 100%! Ready to run in production!");
    process.exit(0);
  }).catch((err) => {
    console.error("❌ ERROR in Next.js initialization:", err);
    process.exit(1);
  });
}).catch((err) => {
  console.error("❌ STEP 5 ERROR in client.execute():", err);
  process.exit(1);
});
