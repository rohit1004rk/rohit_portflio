import express from "express";

import {
  getContactLinks,
  getAdminContactLinks,
  createContactLink,
  updateContactLink,
  reorderContactLinks,
  deleteContactLink,
  permanentlyDeleteContactLink,
} from "../controllers/contactLinkController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * ============================================================
 * PUBLIC
 * ============================================================
 */

/*
 * GET /api/contact-links
 *
 * Public website:
 * Returns only active contact links.
 */
router.get("/", getContactLinks);

/*
 * ============================================================
 * ADMIN
 * ============================================================
 */

/*
 * GET /api/contact-links/admin
 *
 * Returns:
 * - Active links
 * - Disabled links
 *
 * Requires admin authentication.
 */
router.get("/admin", protect, admin, getAdminContactLinks);

/*
 * POST /api/contact-links
 *
 * Create new contact link.
 */
router.post("/", protect, admin, createContactLink);

/*
 * PUT /api/contact-links/reorder
 *
 * IMPORTANT:
 * This route MUST remain before "/:id".
 *
 * Saves the complete order in one request.
 */
router.put("/reorder", protect, admin, reorderContactLinks);

/*
 * PUT /api/contact-links/:id
 *
 * Update:
 * - platform
 * - label
 * - URL
 * - icon
 * - active status
 * - order
 */
router.put("/:id", protect, admin, updateContactLink);

/*
 * DELETE /api/contact-links/:id
 *
 * Normal delete = DISABLE.
 *
 * MongoDB record remains preserved.
 */
router.delete("/:id", protect, admin, deleteContactLink);

/*
 * ============================================================
 * PERMANENT DELETE
 * ============================================================
 *
 * DELETE /api/contact-links/:id/permanent
 *
 * This is the ONLY route that permanently removes
 * the MongoDB document.
 *
 * IMPORTANT:
 * This route MUST remain AFTER "/:id" in the file
 * only because Express route matching is determined by
 * the complete path and method here; the explicit
 * "/:id/permanent" route is still registered separately.
 */
router.delete("/:id/permanent", protect, admin, permanentlyDeleteContactLink);

export default router;
