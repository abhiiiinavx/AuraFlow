import type { Server } from "socket.io";
import { verifyJwt } from "../utils/token.js";

const onlineUsers = new Map<string, Set<string>>();

export function userRoom(userId: string) {
  return `user:${userId}`;
}

export function emitToUser(io: Server, userId: string, event: string, payload: unknown) {
  io.to(userRoom(userId)).emit(event, payload);
}

export function setupSockets(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string") {
      next(new Error("Missing socket token"));
      return;
    }

    try {
      const user = verifyJwt(token);
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as { id: string; name: string };
    socket.join(userRoom(user.id));

    const connections = onlineUsers.get(user.id) ?? new Set<string>();
    connections.add(socket.id);
    onlineUsers.set(user.id, connections);
    io.emit("presence:update", Array.from(onlineUsers.keys()));

    socket.on("task:focus", (payload) => {
      socket.to(userRoom(user.id)).emit("task:focus", {
        ...payload,
        user: user.name
      });
    });

    socket.on("disconnect", () => {
      const current = onlineUsers.get(user.id);
      current?.delete(socket.id);
      if (current && current.size === 0) onlineUsers.delete(user.id);
      io.emit("presence:update", Array.from(onlineUsers.keys()));
    });
  });
}
