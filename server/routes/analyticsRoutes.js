import express from "express";
import { createAnalyticsEvent } from "../controllers/analyticsController.js";

const router = express.Router();

// Public analytics ingestion endpoint.
// No admin authentication is required because portfolio visitors
// must be able to send anonymous analytics events.
router.post("/events", createAnalyticsEvent);

export default router;
