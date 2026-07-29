import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";
import ChatService from "../src/modules/chat/chat.service.js";

const groundId = () => "ground-id-111";
const userId = () => "user-id-789";
const ownerId = () => "owner-id-123";
const msgId = () => "msg-id-001";

function mockGround(overrides = {}) {
  return { id: groundId(), ownerId: ownerId(), name: "Test Ground", isActive: true, deletedAt: null, ...overrides };
}

function mockMessage(overrides = {}) {
  return {
    id: msgId(),
    groundId: groundId(),
    senderId: ownerId(),
    content: "Hello, world!",
    deletedAt: null,
    createdAt: new Date(),
    sender: { id: ownerId(), name: "Test User", avatar: null },
    ...overrides,
  };
}

describe("Chat Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMessages", () => {
    it("should return messages with pagination meta", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.chatMessage.findMany.mockResolvedValue([mockMessage()]);

      const service = new ChatService();
      const result = await service.getMessages(groundId(), ownerId());
      expect(result.messages).toHaveLength(1);
      expect(result.meta.hasMore).toBe(false);
    });

    it("should throw if ground not found", async () => {
      prisma.ground.findUnique.mockResolvedValue(null);
      const service = new ChatService();
      await expect(service.getMessages(groundId(), ownerId())).rejects.toThrow();
    });

    it("should throw if user has no access", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.groundAccess.findUnique.mockResolvedValue(null);
      const service = new ChatService();
      await expect(service.getMessages(groundId(), userId())).rejects.toThrow();
    });

    it("should allow access via groundAccess", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.groundAccess.findUnique.mockResolvedValue({ id: "a1", groundId: groundId(), userId: userId(), accessRole: "staff", isActive: true });
      prisma.chatMessage.findMany.mockResolvedValue([mockMessage()]);

      const service = new ChatService();
      const result = await service.getMessages(groundId(), userId());
      expect(result.messages).toHaveLength(1);
    });
  });

  describe("sendMessage", () => {
    it("should send a valid message", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.chatParticipant.findUnique.mockResolvedValue(null);
      prisma.chatParticipant.upsert.mockResolvedValue({ groundId: groundId(), userId: ownerId(), lastReadAt: new Date() });
      prisma.chatMessage.create.mockResolvedValue(mockMessage());
      prisma.chatParticipant.findMany.mockResolvedValue([{ userId: ownerId() }]);
      prisma.unreadCount.upsert.mockResolvedValue({ groundId: groundId(), userId: ownerId(), count: 1 });

      const service = new ChatService();
      const result = await service.sendMessage(groundId(), ownerId(), "Hello!");
      expect(result.content).toBe("Hello, world!");
    });

    it("should reject empty content", async () => {
      const service = new ChatService();
      await expect(service.sendMessage(groundId(), ownerId(), "")).rejects.toThrow();
    });

    it("should reject content over 2000 chars", async () => {
      const service = new ChatService();
      await expect(service.sendMessage(groundId(), ownerId(), "x".repeat(2001))).rejects.toThrow();
    });
  });

  describe("markAsRead", () => {
    it("should mark messages as read", async () => {
      prisma.ground.findUnique.mockResolvedValue(mockGround());
      prisma.unreadCount.upsert.mockResolvedValue({ groundId: groundId(), userId: ownerId(), count: 0 });
      prisma.chatParticipant.upsert.mockResolvedValue({ groundId: groundId(), userId: ownerId(), lastReadAt: new Date() });

      const service = new ChatService();
      const result = await service.markAsRead(groundId(), ownerId());
      expect(result.message).toBe("Marked as read");
    });
  });

  describe("getUnreadCounts", () => {
    it("should return unread counts for user", async () => {
      prisma.unreadCount.findMany.mockResolvedValue([
        { groundId: groundId(), userId: ownerId(), count: 5 },
      ]);

      const service = new ChatService();
      const result = await service.getUnreadCounts(ownerId());
      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(5);
    });
  });
});
