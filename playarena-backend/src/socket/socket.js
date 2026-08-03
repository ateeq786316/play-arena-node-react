import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import ChatRepo from "../repository/chat.repo.js";
import logger from "../config/logger.js";

let notificationNamespace = null;

export function getNotificationNamespace() {
  return notificationNamespace;
}

export function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: ["http://localhost:3000", "http://localhost:3001"], methods: ["GET", "POST"] },
  });

  const chatNamespace = io.of("/chat");
  const repo = new ChatRepo();

  chatNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, env.ACCESSTOKEN);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  chatNamespace.on("connection", (socket) => {
    socket.on("joinGround", async (groundId) => {
      try {
        const ground = await repo.findGroundById(groundId);
        if (!ground) return socket.emit("error", "Ground not found");

        const access = await repo.findGroundAccess(groundId, socket.userId);
        if (ground.ownerId !== socket.userId && !access) {
          return socket.emit("error", "Access denied");
        }

        await repo.upsertParticipant(groundId, socket.userId, {});
        socket.join(`ground:${groundId}`);
      } catch (err) {
        logger.error({ err }, "Socket joinGround error");
        socket.emit("error", "Failed to join ground");
      }
    });

    socket.on("leaveGround", (groundId) => {
      socket.leave(`ground:${groundId}`);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { groundId, content } = data;
        if (!groundId || !content || content.length > 2000) {
          return socket.emit("error", "Invalid message");
        }

        const message = await repo.createMessage({
          groundId,
          senderId: socket.userId,
          content,
        });

        chatNamespace.to(`ground:${groundId}`).emit("newMessage", message);
      } catch (err) {
        logger.error({ err }, "Socket sendMessage error");
        socket.emit("error", "Failed to send message");
      }
    });

    socket.on("typing", (data) => {
      const { groundId, isTyping } = data;
      if (!groundId) return;
      socket.to(`ground:${groundId}`).emit("typing", {
        userId: socket.userId,
        isTyping: !!isTyping,
      });
    });
  });

  notificationNamespace = io.of("/notifications");

  notificationNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token, env.ACCESSTOKEN);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  notificationNamespace.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
  });

  return io;
}
