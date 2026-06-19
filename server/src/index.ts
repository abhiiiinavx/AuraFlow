import http from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { setupSockets } from "./sockets/socketServer.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true
  }
});

app.set("io", io);
setupSockets(io);

await connectDatabase().catch((error) => {
  console.error("MongoDB connection failed.", error);
});

server.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
