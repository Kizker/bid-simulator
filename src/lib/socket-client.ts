"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocketClient(): Socket {
  if (typeof window === "undefined") {
    // Return dummy on server side during SSR
    return {} as Socket;
  }

  if (!socketInstance) {
    socketInstance = io({
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }

  return socketInstance;
}
