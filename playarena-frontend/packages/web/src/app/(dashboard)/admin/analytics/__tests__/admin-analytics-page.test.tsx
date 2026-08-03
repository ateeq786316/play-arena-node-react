import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AdminAnalyticsPage from "../page";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
const mockUser = vi.hoisted(() => ({ user: { role: "admin" } }));

vi.mock("@playarena/shared/api", () => {
  return { api: { get, post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, ApiError: class extends Error { body: unknown } };
});

vi.mock("@/stores/auth", () => ({
  useAuthStore: (selector: (s: { user: typeof mockUser.user }) => unknown) => selector({ user: mockUser.user }),
}));

import { api } from "@playarena/shared/api";

const summaryResponse = {
  subscribersPerPlan: [
    { plan: { id: "starter", name: "Starter" }, count: 2, statusBreakdown: { active: 1, pending_payment: 1 } },
    { plan: { id: "pro", name: "Professional" }, count: 1, statusBreakdown: { active: 1 } },
  ],
  mrr: 17000,
  statusDistribution: { active: 2, pending_payment: 1, trial: 1 },
  generatedAt: "2026-07-31T04:00:00+05:00",
};

const trendsResponse = {
  trends: [
    { date: "2026-07-29", newSubscriptions: 1, cancellations: 0, mrr: 5000 },
    { date: "2026-07-30", newSubscriptions: 1, cancellations: 0, mrr: 12000 },
  ],
};

const expiringResponse = {
  subscriptions: [
    { id: "s1", owner: { name: "Owner A", email: "a@test.com" }, plan: { name: "Starter" }, status: "active", currentPeriodEnd: "2026-08-02T00:00:00.000Z" },
  ],
};

function mockSuccess() {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.includes("/summary")) return Promise.resolve(summaryResponse);
    if (path.includes("/trends")) return Promise.resolve(trendsResponse);
    if (path.includes("/expiring")) return Promise.resolve(expiringResponse);
    return Promise.resolve({});
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUser.user = { role: "admin" };
});

describe("AdminAnalyticsPage", () => {
  it("shows loading skeletons initially", () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
    render(<AdminAnalyticsPage />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error state and retry when API fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("fail"));
    render(<AdminAnalyticsPage />);
    await waitFor(() => expect(screen.getByText(/Failed to load platform analytics/i)).toBeInTheDocument());
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("shows access denied for non-admin", () => {
    mockUser.user = { role: "owner" };
    render(<AdminAnalyticsPage />);
    expect(screen.getByText(/Access denied. Admin only/i)).toBeInTheDocument();
  });

  it("renders KPIs, plan breakdown, trends and expiring list on success", async () => {
    mockSuccess();
    render(<AdminAnalyticsPage />);
    await waitFor(() => expect(screen.getByText("Platform Analytics")).toBeInTheDocument());
    expect(screen.getByText("Subscribers")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText(/Rs\. 17,000/)).toBeInTheDocument();
    expect(screen.getByText("Subscribers per Plan")).toBeInTheDocument();
    expect(screen.getAllByText("Starter").length).toBeGreaterThan(0);
    expect(screen.getByText("Status Distribution")).toBeInTheDocument();
    expect(screen.getByText("MRR & Subscription Trends")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Expiring Within 7 Days")).toBeInTheDocument());
    expect(screen.getByText("Owner A")).toBeInTheDocument();
  });

  it("shows empty states when no data", async () => {
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path.includes("/summary")) return Promise.resolve({ subscribersPerPlan: [], mrr: 0, statusDistribution: {}, generatedAt: "" });
      if (path.includes("/trends")) return Promise.resolve({ trends: [] });
      if (path.includes("/expiring")) return Promise.resolve({ subscriptions: [] });
      return Promise.resolve({});
    });
    render(<AdminAnalyticsPage />);
    await waitFor(() => expect(screen.getByText("Platform Analytics")).toBeInTheDocument());
    expect(screen.getAllByText(/No subscriptions yet/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/No trend data available/i)).toBeInTheDocument();
    expect(screen.getByText(/No subscriptions expiring within 7 days/i)).toBeInTheDocument();
  });
});
