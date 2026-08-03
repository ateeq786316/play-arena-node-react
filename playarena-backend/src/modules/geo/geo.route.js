import { Router } from "express";
import GeoController from "./geo.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";

const geoRoutes = Router();
const controller = new GeoController();

geoRoutes.get("/nearby", asyncHandler(controller.searchNearby.bind(controller)));

export default geoRoutes;
