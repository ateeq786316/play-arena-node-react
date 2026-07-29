import { vi } from "vitest";

vi.mock("../src/database/db.js", () => {
  const mockPrisma = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    bookingFinance: {
      create: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    bookingPayment: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    booking: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    court: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    ground: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    groundAccess: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    groundInvite: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    groundImage: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    groundSetting: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    groundSchedule: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    region: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    team: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    teamMember: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teamInvite: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    joinRequest: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    teamRatingHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    sportCategory: {
      findMany: vi.fn(),
    },
    matchRequest: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    teamMatch: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    tournament: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tournamentTeam: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    tournamentMatch: {
      create: vi.fn(),
      createMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    paymentMethod: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    groundPaymentMethod: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    cashSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    chatMessage: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    chatParticipant: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    unreadCount: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
    matchRating: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    playerStat: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    playerMatchStat: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    city: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sportCategory: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    paymentMethod: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn(mockPrisma)),
    $disconnect: vi.fn(),
    $connect: vi.fn(),
  };
  return { default: mockPrisma };
});

vi.mock("../src/config/env.js", () => {
  return {
    default: {
      PORT: 3000,
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      JWT_SECRET: "test-secret-key-that-is-at-least-32-chars-long!!",
      JWT_EXPIRES_IN: "7d",
      ACCESSTOKEN: "test-access-token-secret-key-1234567890",
      REFRESHTOKEN: "test-refresh-token-secret-key-12345678",
      BOOKING_EXPIRY_MINUTES: 30,
      SMTP_HOST: "smtp.gmail.com",
      SMTP_PORT: 587,
      SMTP_USER: "test@test.com",
      SMTP_PASS: "testpass",
      SMTP_FROM: "test@test.com",
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      CORS_ORIGIN: "*",
      GOOGLE_CLIENT_ID: "test",
      GOOGLE_CLIENT_SECRET: "test",
      GOOGLE_CALLBACK_URL: "http://localhost:3000/api/auth/google/callback",
    },
  };
});

vi.mock("../src/config/logger.js", () => {
  return {
    default: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
  };
});

vi.mock("../src/config/nodemailer.js", () => {
  return {
    default: vi.fn().mockResolvedValue({ messageId: "test" }),
  };
});

vi.mock("../src/socket/socket.js", () => {
  const mockEmit = vi.fn();
  const mockTo = vi.fn(() => ({ emit: mockEmit }));
  return {
    getNotificationNamespace: vi.fn(() => ({ to: mockTo })),
    setupSocket: vi.fn(),
  };
});
