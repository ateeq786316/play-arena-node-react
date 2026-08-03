import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SubscriptionsPage from "../page";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("@playarena/shared/api", () => {
  return { api: { get, post, patch: vi.fn(), delete: vi.fn() }, ApiError: class extends Error { body: unknown } };
});

import { api } from "@playarena/shared/api";

const plans = [
  { id: "free", name: "Free", price: 0, interval: "monthly", maxGrounds: 1, maxCourtsPerGround: 2, maxBookingsPerMonth: null, commissionRate: 0.1, analyticsRetentionDays: 7, features: {}, isActive: true, sortOrder: 0 },
  { id: "starter", name: "Starter", price: 5000, interval: "monthly", maxGrounds: 3, maxCourtsPerGround: 5, maxBookingsPerMonth: 300, commissionRate: 0.05, analyticsRetentionDays: 30, features: {}, isActive: true, sortOrder: 1 },
];

const myResponse = {
  subscription: { id: "s1", groundOwnerId: "u1", planId: "free", status: "active", currentPeriodStart: new Date().toISOString(), currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(), cancelledAt: null, plan: plans[0] },
  plan: plans[0],
  usage: { grounds: 1, courts: 2, staff: 0, groundsLimit: 1, courtsLimit: 2, staffLimit: 0 },
  trial: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SubscriptionsPage", () => {
  it("shows loading skeletons initially", () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
    render(<SubscriptionsPage />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error state and retry when API fails", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("fail"));
    render(<SubscriptionsPage />);
    await waitFor(() => expect(screen.getByText(/Failed to load subscriptions/i)).toBeInTheDocument());
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("shows usage bars and current plan on success", async () => {
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path.includes("/my")) return Promise.resolve(myResponse);
      return Promise.resolve({ plans });
    });
    render(<SubscriptionsPage />);
    await waitFor(() => expect(screen.getByText("Current Plan: Free")).toBeInTheDocument());
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getAllByText("Limit reached — upgrade to add more").length).toBeGreaterThan(0);  });

  it("shows renewal reminder when plan expires within 7 days", async () => {
    const expiring = {
      ...myResponse,
      subscription: { ...myResponse.subscription!, currentPeriodEnd: new Date(Date.now() + 3 * 86400000).toISOString() },
    };
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path.includes("/my")) return Promise.resolve(expiring);
      return Promise.resolve({ plans });
    });
    render(<SubscriptionsPage />);
    await waitFor(() => expect(screen.getByText(/expires on/i)).toBeInTheDocument());
  });

  it("shows trial countdown when trial ends within 3 days", async () => {
    const trialResponse = {
      ...myResponse,
      subscription: { ...myResponse.subscription!, status: "trial", currentPeriodEnd: new Date(Date.now() + 2 * 86400000).toISOString() },
      trial: { enabled: true, endsAt: new Date(Date.now() + 2 * 86400000).toISOString(), daysRemaining: 2 },
    };
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path.includes("/my")) return Promise.resolve(trialResponse);
      return Promise.resolve({ plans });
    });
    render(<SubscriptionsPage />);
    await waitFor(() => expect(screen.getByText(/free trial ends in/i)).toBeInTheDocument());
  });
});
