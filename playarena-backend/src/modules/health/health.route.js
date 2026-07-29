import { Router } from "express";
import { checkHealth } from "./health.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";

const healthRoutes = Router();

healthRoutes.get("/", asyncHandler(checkHealth));

export default healthRoutes;
