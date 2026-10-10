const path = require("path");

module.exports = {
  apps: [
    {
      name: "bid-simulator",
      script: path.resolve(__dirname, "dist/server.cjs"),
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "5s",
      restart_delay: 2000,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: path.resolve(__dirname, "logs/err.log"),
      out_file: path.resolve(__dirname, "logs/out.log"),
      log_file: path.resolve(__dirname, "logs/combined.log"),
      time: true,
    },
  ],
};
