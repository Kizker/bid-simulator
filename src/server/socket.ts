import { Server as SocketIOServer, Socket } from "socket.io";
import { SimulationEngine } from "./engine";

export function initSocketServer(io: SocketIOServer, engine: SimulationEngine) {
  // Listen to simulation engine internal events and broadcast via Socket.io
  engine.onEvent((event, payload) => {
    switch (event) {
      case "timer_tick": {
        io.to(`room:${payload.roomId}`).emit("timer_tick", payload);
        io.emit("admin_tick", payload);
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
    }
  });

  io.on("connection", (socket: Socket) => {
    // When a client (mobile simulator or admin) joins an auction room
    socket.on("join_room", (roomId: string) => {
      socket.join(`room:${roomId}`);
      const state = engine.getRoomState(roomId);
      if (state) {
        socket.emit("initial_state", {
          room: state.room,
          config: state.config,
          recentBids: state.recentBids,
        });
      }
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(`room:${roomId}`);
    });

    // Mobile simulator client places a bid
    socket.on("place_bid", async (data: { roomId: string; bidderName: string; amount: number }) => {
      const result = await engine.placeBid({
        roomId: data.roomId,
        bidderName: data.bidderName || "Kamu",
        bidderType: "USER",
        amount: data.amount,
      });

      if (!result.success) {
        socket.emit("bid_error", { message: result.message });
      } else {
        socket.emit("bid_success", { bid: result.bid });
      }
    });

    // Admin CMS commands
    socket.on("admin_command", async (data: { action: string; roomId: string; payload?: any }) => {
      const { action, roomId, payload } = data;

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
