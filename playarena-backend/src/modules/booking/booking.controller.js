import BookingService from "./booking.service.js";

export default class BookingController {
  constructor() {
    this.service = new BookingService();
  }

  async createBooking(req, res) {
    const booking = await this.service.createBooking(req.userId, req.body);
    res.status(201).json({ message: "Booking created", booking });
  }

  async getMyBookings(req, res) {
    const bookings = await this.service.getMyBookings(req.userId);
    res.status(200).json({ bookings });
  }

  async getBookingById(req, res) {
    const booking = await this.service.getBookingById(req.userId, req.params.id);
    res.status(200).json({ booking });
  }

  async cancelBooking(req, res) {
    const booking = await this.service.cancelBooking(req.userId, req.params.id);
    res.status(200).json({ message: "Booking cancelled", booking });
  }

  async walkinBooking(req, res) {
    const booking = await this.service.walkinBooking(req.params.groundId, req.userId, req.body);
    res.status(201).json({ message: "Walk-in booking created", booking });
  }

  async getGroundBookings(req, res) {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.date) filters.date = req.query.date;
    const bookings = await this.service.getGroundBookings(req.params.groundId, req.userId, filters);
    res.status(200).json({ bookings });
  }

  async updateBookingStatus(req, res) {
    const { status, reason } = req.body;
    const booking = await this.service.updateBookingStatus(req.params.id, req.userId, status, reason);
    res.status(200).json({ message: `Booking ${status}`, booking });
  }

  async recordPayment(req, res) {
    const payment = await this.service.recordPayment(req.params.id, req.userId, req.body);
    res.status(201).json({ message: "Payment recorded", payment });
  }

  async getBookingFinance(req, res) {
    const result = await this.service.getBookingFinance(req.params.id, req.userId);
    res.status(200).json(result);
  }

  async getSlots(req, res) {
    const result = await this.service.getSlots(req.params.courtId, req.query.date);
    res.status(200).json(result);
  }
}
