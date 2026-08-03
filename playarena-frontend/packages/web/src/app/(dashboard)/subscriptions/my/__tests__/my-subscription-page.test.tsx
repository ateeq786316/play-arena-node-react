import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import MySubscriptionPage from "../page";

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock("@playarena/shared/api", () => {
  return { api: { get, post, patch: vi.fn(), delete: vi.fn() }, ApiError: class extends Error { body: unknown } };
});

import { api } from "@playarena/shared/api";

const plans = [
  { id: "free", name: "Free", price: 0, interval: "monthly", maxGrounds: 1, maxCourtsPerGround: 2, maxBookingsPerMonth: null, commissionRate: 0.1, analyticsRetentionDays: 7, features: {}, isActive: true, sortOrder: 0 },
  { id: "starter", name: "Starter", price: 5000, interval: "monthly", maxGrounds: 3, maxCourtsPerGround: 5, maxBookingsPerMonth: 300, commissionRate: 0.05, analyticsRetentionDays: 30, features: {}, isActive: true, sortOrder: 1 },
];

const plan = plans[0];

const myResponse = {
  subscription: { id: "s1", groundOwnerId: "u1", planId: "free", status: "active", currentPeriodStart: new Date().toISOString(), currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(), cancelledAt: null, plan },
  plan,
  usage: { grounds: 1, courts: 0, staff: 0, groundsLimit: 1, courtsLimit: 2, staffLimit: 0 },
  trial: null,
};

function mockGetFor(response: unknown) {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.includes("/plans")) return Promise.resolve({ plans });
    return Promise.resolve(response);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MySubscriptionPage", () => {
  it("shows loading skeletons initially", () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
    render(<MySubscriptionPage />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error state and retry on failure", async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error("fail"));
    render(<MySubscriptionPage />);
    await waitFor(() => expect(screen.getByText(/Failed to load your subscription/i)).toBeInTheDocument());
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("shows empty state with plans link when no subscription", async () => {
    mockGetFor({ subscription: null, plan: plan, usage: { grounds: 0, courts: 0, staff: 0, groundsLimit: 1, courtsLimit: 2, staffLimit: 0 }, trial: null });
    render(<MySubscriptionPage />);
    await waitFor(() => expect(screen.getByText("No active subscription.")).toBeInTheDocument());
    expect(screen.getByText("View Plans")).toBeInTheDocument();
  });

  it("shows plan details and usage on success", async () => {
    mockGetFor(myResponse);
    render(<MySubscriptionPage />);
    await waitFor(() => expect(screen.getByText("Free")).toBeInTheDocument());
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByText("Cancel Subscription")).toBeInTheDocument();
  });

  it("shows downgrade options for a higher plan", async () => {
    const starterResponse = {
      ...myResponse,
      subscription: { ...myResponse.subscription!, planId: "starter", plan: plans[1] },
      plan: plans[1],
      usage: { grounds: 2, courts: 3, staff: 1, groundsLimit: 3, courtsLimit: 5, staffLimit: 0 },
    };
    mockGetFor(starterResponse);
    render(<MySubscriptionPage />);
    await waitFor(() => expect(screen.getByText("Starter")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Free" })).toBeInTheDocument();
  });

  it("shows trial countdown card for trial subscription", async () => {
    const trialResponse = {
      ...myResponse,
      subscription: { ...myResponse.subscription!, status: "trial", currentPeriodEnd: new Date(Date.now() + 2 * 86400000).toISOString() },
      trial: { enabled: true, endsAt: new Date(Date.now() + 2 * 86400000).toISOString(), daysRemaining: 2 },
    };
    mockGetFor(trialResponse);
    render(<MySubscriptionPage />);
    await waitFor(() => expect(screen.getByText(/Free trial ends in/i)).toBeInTheDocument());
  });
});
