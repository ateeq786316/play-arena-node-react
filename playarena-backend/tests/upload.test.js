import { describe, it, expect, vi, beforeEach } from "vitest";
import UploadService from "../src/modules/upload/upload.service.js";

vi.mock("../src/config/upload/s3.js", () => ({
  default: { send: vi.fn().mockResolvedValue({}) },
}));

function mockFile(overrides = {}) {
  return {
    originalname: "test.jpg",
    mimetype: "image/jpeg",
    size: 1024 * 1024,
    buffer: Buffer.from("test"),
    ...overrides,
  };
}

describe("Upload Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("upload", () => {
    it("should upload a valid file", async () => {
      const service = new UploadService();
      const result = await service.upload(mockFile(), "avatar", "user-id");
      expect(result.type).toBe("avatar");
      expect(result.url).toContain("amazonaws.com");
    });

    it("should throw if no file", async () => {
      const service = new UploadService();
      await expect(service.upload(null, "avatar", "user-id")).rejects.toThrow();
    });

    it("should throw if invalid mime type", async () => {
      const service = new UploadService();
      await expect(service.upload(mockFile({ mimetype: "text/html" }), "avatar", "user-id")).rejects.toThrow();
    });

    it("should throw if file too large", async () => {
      const service = new UploadService();
      await expect(service.upload(mockFile({ size: 20 * 1024 * 1024 }), "avatar", "user-id")).rejects.toThrow();
    });

    it("should accept pdf for booking-proof", async () => {
      const service = new UploadService();
      const result = await service.upload(mockFile({ mimetype: "application/pdf" }), "booking-proof", "user-id");
      expect(result.url).toContain("amazonaws.com");
    });

    it("should reject pdf for avatar", async () => {
      const service = new UploadService();
      await expect(service.upload(mockFile({ mimetype: "application/pdf" }), "avatar", "user-id")).rejects.toThrow();
    });
  });
});
