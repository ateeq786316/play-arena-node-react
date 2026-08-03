import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AnalyticsPage from "../page";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@playarena/shared/api", () => {
  return { api: { get, post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, ApiError: class extends Error { body: unknown } };
});

import { api } from "@playarena/shared/api";

const ground = { id: "g1", name: "Main Arena" };

const dashboardResponse = {
  snapshots: [
    { date: "2026-07-25", totalRevenue: 20000, onlineRevenue: 12000, offlineRevenue: 8000, totalBookings: 4, completedBookings: 3, cancelledBookings: 1, utilizationRate: 0.5, newCustomers: 2, returningCustomers: 2, avgBookingValue: 5000 },
    { date: "2026-07-26", totalRevenue: 30000, onlineRevenue: 18000, offlineRevenue: 12000, totalBookings: 6, completedBookings: 5, cancelledBookings: 1, utilizationRate: 0.7, newCustomers: 3, returningCustomers: 3, avgBookingValue: 5000 },
  ],
  revenue: { totalRevenue: 50000, totalBookings: 10, avgBookingValue: 5000 },
  bookings: { total: 10, completed: 8, cancelled: 2 },
  dataAsOf: "2026-07-30",
  retentionDays: 7,
  retentionNotice: null,
};

const heatmapResponse = {
  heatmap: [
    { id: "h1", groundId: "g1", date: "2026-07-26", hour: 10, courtId: "c1", bookings: 2, revenue: 10000 },
  ],
};

function mockSuccess() {
  vi.mocked(api.get).mockImplementation((path: string) => {
    if (path.includes("/heatmap")) return Promise.resolve(heatmapResponse);
    if (path.includes("/dashboard")) return Promise.resolve(dashboardResponse);
    return Promise.resolve({ grounds: [ground] });
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AnalyticsPage", () => {
  it("shows loading skeletons initially", () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
    render(<AnalyticsPage />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error state and retry when API fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("fail"));
    render(<AnalyticsPage />);
    await waitFor(() => expect(screen.getByText(/Failed to load analytics/i)).toBeInTheDocument());
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("shows empty state when owner has no grounds", async () => {
    vi.mocked(api.get).mockResolvedValue({ grounds: [] });
    render(<AnalyticsPage />);
    await waitFor(() => expect(screen.getByText(/Select a ground to view analytics/i)).toBeInTheDocument());
  });

  it("renders KPIs, charts and heatmap on success", async () => {
    mockSuccess();
    render(<AnalyticsPage />);
    await waitFor(() => expect(screen.getByText("Total Revenue")).toBeInTheDocument());
    expect(screen.getByText(/Rs\. 50,000/)).toBeInTheDocument();
    expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
    expect(screen.getByText("Booking Trends")).toBeInTheDocument();
    expect(screen.getByText("Utilization Heatmap")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Data as of/i)).toBeInTheDocument());
    expect(screen.getByText(/7-day retention window/i)).toBeInTheDocument();
  });

  it("shows retention notice when window is clamped", async () => {
    vi.mocked(api.get).mockImplementation((path: string) => {
      if (path.includes("/heatmap")) return Promise.resolve(heatmapResponse);
      if (path.includes("/dashboard")) return Promise.resolve({ ...dashboardResponse, retentionNotice: "Data older than 7 days is outside your plan's retention window. Upgrade to access more history." });
      return Promise.resolve({ grounds: [ground] });
    });
    render(<AnalyticsPage />);
    await waitFor(() => expect(screen.getByText(/outside your plan's retention window/i)).toBeInTheDocument());
    expect(screen.getByText(/Upgrade to unlock more/i)).toBeInTheDocument();
    expect(screen.getByText(/You can view up to 7 days of history/i)).toBeInTheDocument();
  });
});
