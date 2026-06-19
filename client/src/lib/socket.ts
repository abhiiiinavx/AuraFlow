import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket: Socket | null = null;

export function getSocket() {
  const token = useAuthStore.getState().token;
  if (!token || token === "auraflow-admin-token") return null;

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? window.location.origin, {
      auth: { token },
      transports: ["websocket"]
    });
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
