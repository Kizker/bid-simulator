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

  console.log("🔍 STEP 7: calling next({ dev: false, dir: __dirname })...");
  const app = next({
    dev: false,
    hostname: "0.0.0.0",
    port: 3000,
    dir: __dirname,
    conf: { experimental: { cpus: 1 } },
  });
  console.log("✅ STEP 7: OK");

  console.log("🔍 STEP 8: app.prepare()...");
  app.prepare().then(() => {
    console.log("🎉 ALL STEPS PASSED! Next.js and SQLite are 100% operational!");
    process.exit(0);
  }).catch((err) => {
    console.error("❌ STEP 8 ERROR in app.prepare():", err);
    process.exit(1);
  });
}).catch((err) => {
  console.error("❌ STEP 5 ERROR in client.execute():", err);
  process.exit(1);
});
