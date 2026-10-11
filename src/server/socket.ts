import { Server as SocketIOServer, Socket } from "socket.io";
import { SimulationEngine } from "./engine";

export function initSocketServer(io: SocketIOServer, engine: SimulationEngine) {
  // Listen to simulation engine internal events and broadcast via Socket.io
  engine.onEvent((event, payload) => {
    switch (event) {
      case "timer_tick": {
        io.to(`room:${payload.roomId}`).emit("timer_tick", payload);
        break;
      }
      case "bid_placed": {
        io.to(`room:${payload.room.id}`).emit("bid_placed", payload);
        io.emit("admin_bid_placed", payload);
        break;
      }
      case "room_updated": {
        io.to(`room:${payload.id}`).emit("room_updated", payload);
        io.emit("admin_room_updated", payload);
        break;
      }
      case "time_extended": {
        io.to(`room:${payload.roomId}`).emit("time_extended", payload);
        break;
      }
      case "auction_ended": {
        io.to(`room:${payload.roomId}`).emit("auction_ended", payload);
        io.emit("admin_auction_ended", payload);
        break;
      }
      case "bids_cleared": {
        io.to(`room:${payload.roomId}`).emit("bids_cleared", payload);
        io.emit("admin_bids_cleared", payload);
        break;
      }
      case "config_updated": {
        io.to(`room:${payload.roomId}`).emit("config_updated", payload);
        io.emit("admin_config_updated", payload);
        break;
      }
      case "schedule_updated": {
        io.emit("schedule_updated", payload);
        break;
      }
      case "schedule_applied": {
        io.emit("schedule_applied", payload);
        break;
      }
      case "session_started": {
        io.emit("session_started", payload);
        break;
      }
      case "session_ended": {
        io.emit("session_ended", payload);
        break;
      }
      case "all_rooms_paused": {
        io.emit("all_rooms_paused", payload);
        break;
      }
      case "all_rooms_started": {
        io.emit("all_rooms_started", payload);
        break;
      }
      case "all_configs_updated": {
        io.emit("all_configs_updated", payload);
        break;
      }
      case "all_bots_paused": {
        io.emit("all_bots_paused", payload);
        break;
      }
      case "all_bots_started": {
        io.emit("all_bots_started", payload);
        break;
      }
      case "all_rooms_reset": {
        io.emit("all_rooms_reset", payload);
        break;
      }
    }
  });

  io.on("connection", (socket: Socket) => {
    // When a client (mobile simulator or admin) joins an auction room
    socket.on("join_room", (roomId: string) => {
      socket.join(`room:${roomId}`);
      const state = engine.getRoomState(roomId);
      if (state) {
        // Auto-aktifkan room dan timer jika lelang tidak aktif atau waktu habis
        if (state.room.status !== "ACTIVE" || state.room.timeRemaining <= 0) {
          state.room.status = "ACTIVE";
          if (!state.room.timeRemaining || state.room.timeRemaining <= 0) {
            state.room.timeRemaining = state.room.totalDurationSeconds || 36000;
          }
          state.config.botEnabled = 1;
          engine.startTimer(roomId);
        }

        socket.emit("initial_state", {
          room: state.room,
          config: state.config,
          recentBids: state.recentBids,
        });

        // Jika posisi pengguna sudah di atas saat masuk ruang, jadwalkan penawar lain segera (3-5 detik)
        if (state.room.highestBidderType === "USER" || state.room.highestBidderName === "Kamu") {
          engine.scheduleCompetitorResponse(roomId, 3000, 5000);
        }
      }
    });

    socket.on("request_competitor_bid", (data: { roomId: string }) => {
      engine.scheduleCompetitorResponse(data.roomId, 3000, 5000);
    });

    socket.on("get_schedule", () => {
      socket.emit("schedule_updated", engine.getScheduleInfo());
    });

    socket.on("get_server_time", (clientSentTime?: number) => {
      socket.emit("server_time", {
        clientSentTime,
        serverTime: Date.now(),
      });
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(`room:${roomId}`);
    });

    // Mobile simulator client places a bid
    socket.on("place_bid", async (data: { roomId: string; bidderName: string; amount: number; clientPrice?: number }) => {
      const result = await engine.placeBid({
        roomId: data.roomId,
        bidderName: data.bidderName || "Kamu",
        bidderType: "USER",
        amount: data.amount,
        clientPrice: data.clientPrice,
      });

      if (!result.success) {
        if (result.code === "ALREADY_HIGHEST") {
          engine.scheduleCompetitorResponse(data.roomId, 3000, 5000);
        }
        const state = engine.getRoomState(data.roomId);
        socket.emit("bid_error", {
          message: result.message,
          code: result.code,
          latestRoom: state?.room,
          latestBids: state?.recentBids,
        });
      } else {
        socket.emit("bid_success", { bid: result.bid, roomId: data.roomId });
      }
    });

    // Admin CMS commands (Support both Global Command and Single-Unit Command)
    socket.on("admin_command", async (data: { action: string; roomId?: string; payload?: any }) => {
      const { action, roomId, payload } = data;

      // 1. GLOBAL COMMAND (Affecting ALL auction rooms)
      if (!roomId || roomId === "ALL") {
        console.log(`📡 [AdminCommand] Received global action: ${action}`);
        switch (action) {
          case "START_BOTS":
          case "START":
          case "START_ALL":
            engine.startAllBots();
            break;
          case "PAUSE_BOTS":
          case "PAUSE":
          case "PAUSE_ALL":
            engine.pauseAllBots();
            break;
          case "START_ROOMS":
            engine.startAllRooms();
            break;
          case "PAUSE_ROOMS":
            engine.pauseAllRooms();
            break;
          case "RESET":
          case "RESET_ALL":
            await engine.resetAllRoomsToOpenBid();
            break;
          case "END_ALL":
            engine.endAllRooms();
            break;
          case "UPDATE_SCHEDULE":
            if (payload) {
              await engine.setSessionSchedule(
                payload.startTime,
                payload.endTime,
                payload.autoSync !== undefined ? payload.autoSync : true,
                payload.applyNow !== undefined ? payload.applyNow : true
              );
            }
            break;
          case "APPLY_SCHEDULE":
            engine.applyScheduleToAllRooms(true);
            break;
          case "ADD_TIME":
          case "ADD_TIME_ALL":
            engine.addTimeToAllRooms(payload?.seconds || 30);
            break;
          case "UPDATE_CONFIG":
          case "UPDATE_ALL_CONFIG":
            engine.updateAllConfigs(payload || {});
            break;
          case "TRIGGER_RANDOM_BOT":
          case "FORCE_BOT_BID":
            await engine.triggerRandomBotBid();
            break;
          case "RELOAD_DB":
            await engine.reloadFromDatabase();
            break;
        }
        return;
      }

      // 2. SINGLE UNIT COMMAND (Fallback for individual room control)
      switch (action) {
        case "START":
          engine.startTimer(roomId);
          break;
        case "PAUSE":
          engine.pauseTimer(roomId);
          break;
        case "RESET":
          engine.resetRoom(roomId);
          break;
        case "ADD_TIME":
          engine.addTime(roomId, payload?.seconds || 30);
          break;
        case "FORCE_BOT_BID":
          await engine.forceBotBid(roomId);
          break;
        case "UPDATE_CONFIG":
          engine.updateConfig(roomId, payload);
          break;
        case "RELOAD_DB":
          await engine.reloadFromDatabase(roomId);
          break;
      }
    });

    // Admin asks for all rooms state
    socket.on("get_admin_overview", () => {
      const rooms = engine.getAllRooms();
      socket.emit("admin_overview", { rooms });
    });
  });

  console.log("⚡ Socket.io handlers configured.");
}
