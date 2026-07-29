import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../src/database/db.js";
import NotificationService from "../src/modules/notification/notification.service.js";

const userId = () => "user-id-789";
const notifId = () => "notif-id-001";

function mockNotification(overrides = {}) {
  return {
    id: notifId(),
    userId: userId(),
    type: "booking_created",
    title: "New Booking",
    message: "A new booking has been created",
    data: null,
    readAt: null,
    deletedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNotifications", () => {
    it("should return paginated notifications", async () => {
      prisma.notification.findMany.mockResolvedValue([mockNotification()]);
      prisma.notification.count.mockResolvedValue(1);

      const service = new NotificationService();
      const result = await service.getNotifications(userId(), { page: 1, limit: 20 });
      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should clamp page and limit", async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      const service = new NotificationService();
      const result = await service.getNotifications(userId(), { page: 0, limit: 999 });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });
  });

  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      prisma.notification.count.mockResolvedValue(3);

      const service = new NotificationService();
      const result = await service.getUnreadCount(userId());
      expect(result.count).toBe(3);
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });

      const service = new NotificationService();
      const result = await service.markAsRead(userId(), notifId());
      expect(result.message).toBe("Marked as read");
    });

    it("should throw if not found", async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const service = new NotificationService();
      await expect(service.markAsRead(userId(), "nonexistent")).rejects.toThrow();
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all as read", async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const service = new NotificationService();
      const result = await service.markAllAsRead(userId());
      expect(result.message).toBe("All notifications marked as read");
    });
  });

  describe("deleteNotification", () => {
    it("should soft delete a notification", async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });

      const service = new NotificationService();
      const result = await service.deleteNotification(userId(), notifId());
      expect(result.message).toBe("Notification deleted");
    });

    it("should throw if not found", async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const service = new NotificationService();
      await expect(service.deleteNotification(userId(), "nonexistent")).rejects.toThrow();
    });
  });

  describe("createNotification", () => {
    it("should create and return notification", async () => {
      prisma.notification.create.mockResolvedValue(mockNotification());

      const service = new NotificationService();
      const result = await service.createNotification({
        userId: userId(),
        type: "booking_created",
        title: "New Booking",
      });
      expect(result.title).toBe("New Booking");
    });
  });
});
