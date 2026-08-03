import AnalyticsService from "./analytics.service.js";
import { toCSV } from "../../utils/csv.js";

export default class AnalyticsController {
  constructor() {
    this.service = new AnalyticsService();
  }

  async getDashboard(req, res) {
    const result = await this.service.getDashboard(req.params.groundId, req.userId, req.query);
    res.status(200).json(result);
  }

  async getHeatmap(req, res) {
    const { startDate, endDate } = req.query;
    const result = await this.service.getHeatmap(req.params.groundId, req.userId, startDate, endDate);
    res.status(200).json(result);
  }

  async generateReport(req, res) {
    const { startDate, endDate, export: exportFormat } = req.query;
    const result = await this.service.generateReport(req.params.groundId, req.userId, startDate, endDate);

    if (exportFormat === "csv") {
      const headers = ["date", "revenue", "online", "offline", "bookings", "completed", "cancelled", "utilization", "new", "returning", "avgValue"];
      const rows = result.snapshots.map((s) => ({
        date: new Date(s.date).toISOString().slice(0, 10),
        revenue: Number(s.totalRevenue).toFixed(2),
        online: Number(s.onlineRevenue).toFixed(2),
        offline: Number(s.offlineRevenue).toFixed(2),
        bookings: s.totalBookings,
        completed: s.completedBookings,
        cancelled: s.cancelledBookings,
        utilization: s.utilizationRate == null ? "" : Number(s.utilizationRate).toFixed(4),
        new: s.newCustomers,
        returning: s.returningCustomers,
        avgValue: s.avgBookingValue == null ? "" : Number(s.avgBookingValue).toFixed(2),
      }));
      const range = `${startDate || "start"}_${endDate || "end"}`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="report_${req.params.groundId}_${range}.csv"`);
      return res.status(200).send(toCSV(headers, rows));
    }

    res.status(200).json({ report: result });
  }

  async getPlatformSummary(req, res) {
    const result = await this.service.getPlatformSummary();
    res.status(200).json(result);
  }

  async getPlatformExpiring(req, res) {
    const { days } = req.query;
    const subscriptions = await this.service.getPlatformExpiring(days);
    res.status(200).json({ subscriptions });
  }

  async getPlatformTrends(req, res) {
    const { startDate, endDate } = req.query;
    const result = await this.service.getPlatformTrends(startDate, endDate);
    res.status(200).json(result);
  }
}
