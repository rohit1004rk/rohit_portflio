import mongoose from "mongoose";

import ContactLink from "../models/ContactLink.js";

/*
 * ============================================================
 * LEGACY CONTACT LINKS
 * ============================================================
 */

const LEGACY_CONTACT_LINKS = [
  {
    migrationKey: "email",
    platform: "Email",
    label: "Email me",
    url: "mailto:YOUR_EMAIL_HERE",
    icon: "email",
    order: 0,
  },

  {
    migrationKey: "linkedin",
    platform: "LinkedIn",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/rohit1004rk",
    icon: "linkedin",
    order: 1,
  },

  {
    migrationKey: "github",
    platform: "GitHub",
    label: "GitHub",
    url: "https://github.com/rohit1004rk",
    icon: "github",
    order: 2,
  },

  {
    migrationKey: "resume",
    platform: "Resume",
    label: "View Resume",
    url: "/resume",
    icon: "resume",
    order: 3,
  },

  {
    migrationKey: "youtube",
    platform: "YouTube",
    label: "YouTube",
    url: "https://www.youtube.com/",
    icon: "youtube",
    order: 4,
  },
];

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const cleanString = (value, maxLength) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const normalizeOrder = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.floor(number));
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
 * ============================================================
 * SAFE LEGACY MIGRATION
 * ============================================================
 *
 * Important:
 *
 * - Existing records are NEVER overwritten.
 * - Existing custom URLs are NEVER replaced.
 * - Existing labels are NEVER replaced.
 * - Existing order is NEVER replaced.
 * - Missing migrationKey can be added safely.
 * - Missing legacy records may be created.
 * ============================================================
 */

const ensureLegacyContactLinks = async () => {
  for (const legacyLink of LEGACY_CONTACT_LINKS) {
    try {
      let existing = await ContactLink.findOne({
        migrationKey: legacyLink.migrationKey,
      });

      if (!existing) {
        existing = await ContactLink.findOne({
          platform: legacyLink.platform,
          url: legacyLink.url,
        });
      }

      if (existing) {
        if (!existing.migrationKey) {
          existing.migrationKey = legacyLink.migrationKey;

          await existing.save();
        }

        continue;
      }

      /*
       * Do not create an email legacy record
       * when the placeholder has not been configured.
       */
      if (
        legacyLink.migrationKey === "email" &&
        legacyLink.url === "mailto:YOUR_EMAIL_HERE"
      ) {
        continue;
      }

      await ContactLink.create({
        migrationKey: legacyLink.migrationKey,
        platform: legacyLink.platform,
        label: legacyLink.label,
        url: legacyLink.url,
        icon: legacyLink.icon,
        isActive: true,
        order: legacyLink.order,
      });
    } catch (error) {
      console.error(
        `Contact link migration failed for "${legacyLink.migrationKey}":`,
        error,
      );
    }
  }
};

/*
 * ============================================================
 * PUBLIC
 * GET /api/contact-links
 * ============================================================
 */

export const getContactLinks = async (req, res) => {
  try {

    const links = await ContactLink.find({
      isActive: true,
    })
      .sort({
        order: 1,
        createdAt: 1,
      })
      .lean();

    return res.status(200).json(links);
  } catch (error) {
    console.error("Get contact links error:", error);

    return res.status(500).json({
      message: "Failed to fetch contact links.",
    });
  }
};

/*
 * ============================================================
 * ADMIN
 * GET /api/contact-links/admin
 * ============================================================
 *
 * Returns:
 *
 * - Active records
 * - Disabled records
 *
 * Permanently deleted records naturally disappear.
 * ============================================================
 */

export const getAdminContactLinks = async (req, res) => {
  try {

    const links = await ContactLink.find({})
      .sort({
        order: 1,
        createdAt: 1,
      })
      .lean();

    return res.status(200).json(links);
  } catch (error) {
    console.error("Get admin contact links error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin contact links.",
    });
  }
};

/*
 * ============================================================
 * ADMIN
 * POST /api/contact-links
 * ============================================================
 */

export const createContactLink = async (req, res) => {
  try {
    const platform = cleanString(req.body?.platform, 50);

    const label = cleanString(req.body?.label, 100);

    const url = cleanString(req.body?.url, 500);

    const icon = cleanString(req.body?.icon, 100);

    const order = normalizeOrder(req.body?.order);

    const isActive = req.body?.isActive !== false;

    if (!platform) {
      return res.status(400).json({
        message: "Platform is required.",
      });
    }

    if (!label) {
      return res.status(400).json({
        message: "Label is required.",
      });
    }

    if (!url) {
      return res.status(400).json({
        message: "URL is required.",
      });
    }

    const contactLink = await ContactLink.create({
      platform,
      label,
      url,
      icon,
      isActive,
      order,
    });

    return res.status(201).json({
      message: "Contact link created successfully.",
      contactLink,
    });
  } catch (error) {
    console.error("Create contact link error:", error);

    return res.status(500).json({
      message: "Failed to create contact link.",
    });
  }
};

/*
 * ============================================================
 * ADMIN
 * PUT /api/contact-links/:id
 * ============================================================
 */

export const updateContactLink = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid contact link ID.",
      });
    }

    const contactLink = await ContactLink.findById(id);

    if (!contactLink) {
      return res.status(404).json({
        message: "Contact link not found.",
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "platform")) {
      const platform = cleanString(req.body.platform, 50);

      if (!platform) {
        return res.status(400).json({
          message: "Platform cannot be empty.",
        });
      }

      contactLink.platform = platform;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "label")) {
      const label = cleanString(req.body.label, 100);

      if (!label) {
        return res.status(400).json({
          message: "Label cannot be empty.",
        });
      }

      contactLink.label = label;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "url")) {
      const url = cleanString(req.body.url, 500);

      if (!url) {
        return res.status(400).json({
          message: "URL cannot be empty.",
        });
      }

      contactLink.url = url;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "icon")) {
      contactLink.icon = cleanString(req.body.icon, 100);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "isActive")) {
      contactLink.isActive = req.body.isActive === true;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "order")) {
      contactLink.order = normalizeOrder(req.body.order);
    }

    await contactLink.save();

    return res.status(200).json({
      message: "Contact link updated successfully.",
      contactLink,
    });
  } catch (error) {
    console.error("Update contact link error:", error);

    return res.status(500).json({
      message: "Failed to update contact link.",
    });
  }
};

/*
 * ============================================================
 * ADMIN
 * PUT /api/contact-links/reorder
 * ============================================================
 *
 * Body:
 *
 * {
 *   "orderedIds": [
 *     "mongo-id-1",
 *     "mongo-id-2",
 *     "mongo-id-3"
 *   ]
 * }
 *
 * This is the IMPORTANT ordering endpoint.
 *
 * Instead of sending one request for every record,
 * the complete order is sent in ONE request.
 *
 * MongoDB receives:
 *
 * first  -> order 0
 * second -> order 1
 * third  -> order 2
 * ...
 *
 * This guarantees:
 *
 * 0, 1, 2, 3, 4...
 *
 * with no duplicate ordering caused by frontend
 * sequential updates.
 * ============================================================
 */

export const reorderContactLinks = async (req, res) => {
  try {
    const orderedIds = req.body?.orderedIds;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({
        message: "orderedIds must be an array.",
      });
    }

    if (orderedIds.length === 0) {
      return res.status(400).json({
        message: "orderedIds cannot be empty.",
      });
    }

    /*
     * Validate every MongoDB ID.
     */

    const invalidIds = orderedIds.filter((id) => !isValidObjectId(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "One or more contact link IDs are invalid.",
        invalidIds,
      });
    }

    /*
     * Prevent duplicate IDs.
     */

    const uniqueIds = new Set(orderedIds);

    if (uniqueIds.size !== orderedIds.length) {
      return res.status(400).json({
        message: "Duplicate contact link IDs are not allowed.",
      });
    }

    /*
     * Fetch records represented by
     * the supplied IDs.
     */

    const existingLinks = await ContactLink.find({
      _id: {
        $in: orderedIds,
      },
    }).select("_id");

    /*
     * Every supplied ID must exist.
     */

    if (existingLinks.length !== orderedIds.length) {
      const existingIdSet = new Set(
        existingLinks.map((link) => String(link._id)),
      );

      const missingIds = orderedIds.filter(
        (id) => !existingIdSet.has(String(id)),
      );

      return res.status(404).json({
        message: "One or more contact links were not found.",
        missingIds,
      });
    }

    /*
     * Build ONE bulk operation.
     *
     * order:
     *
     * index 0 -> order 0
     * index 1 -> order 1
     * index 2 -> order 2
     * ...
     */

    const operations = orderedIds.map((id, index) => ({
      updateOne: {
        filter: {
          _id: id,
        },

        update: {
          $set: {
            order: index,
          },
        },
      },
    }));

    await ContactLink.bulkWrite(operations, {
      ordered: true,
    });

    /*
     * Return the backend/database
     * source of truth.
     */

    const updatedLinks = await ContactLink.find({})
      .sort({
        order: 1,
        createdAt: 1,
      })
      .lean();

    return res.status(200).json({
      message: "Contact link order updated successfully.",
      contactLinks: updatedLinks,
    });
  } catch (error) {
    console.error("Reorder contact links error:", error);

    return res.status(500).json({
      message: "Failed to reorder contact links.",
    });
  }
};

/*
 * ============================================================
 * DISABLE
 * DELETE /api/contact-links/:id
 * ============================================================
 *
 * Normal Delete = DISABLE.
 *
 * MongoDB record is preserved.
 *
 * Public Contact page will hide it because:
 *
 * isActive = false
 * ============================================================
 */

export const deleteContactLink = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid contact link ID.",
      });
    }

    const contactLink = await ContactLink.findById(id);

    if (!contactLink) {
      return res.status(404).json({
        message: "Contact link not found.",
      });
    }

    contactLink.isActive = false;

    await contactLink.save();

    return res.status(200).json({
      message: "Contact link disabled successfully.",
      contactLink,
    });
  } catch (error) {
    console.error("Disable contact link error:", error);

    return res.status(500).json({
      message: "Failed to disable contact link.",
    });
  }
};

/*
 * ============================================================
 * PERMANENT DELETE
 * DELETE /api/contact-links/:id/permanent
 * ============================================================
 *
 * THIS is the actual MongoDB deletion.
 *
 * It is intentionally separate from normal
 * Disable/Delete.
 *
 * IMPORTANT:
 * - Record must exist before deletion.
 * - findByIdAndDelete() performs the actual MongoDB delete.
 * - The deleted record is NOT recreated here.
 * - deletedCount/result is verified.
 * ============================================================
 */

export const permanentlyDeleteContactLink = async (req, res) => {
  try {
    const { id } = req.params;

    /*
     * 1. Validate MongoDB ObjectId.
     */

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid contact link ID.",
      });
    }

    /*
     * 2. Verify that the record exists.
     */

    const existingContactLink = await ContactLink.findById(id);

    if (!existingContactLink) {
      return res.status(404).json({
        message:
          "Contact link not found. It may already have been permanently deleted.",
      });
    }

    /*
     * 3. ACTUAL MongoDB permanent deletion.
     */

    const deletedContactLink = await ContactLink.findByIdAndDelete(id);

    /*
     * 4. Verify that MongoDB actually
     * returned/deleted the record.
     */

    if (!deletedContactLink) {
      return res.status(404).json({
        message: "Contact link could not be permanently deleted.",
      });
    }

    /*
     * 5. Return the exact deleted MongoDB ID.
     */

    return res.status(200).json({
      message: "Contact link permanently deleted.",
      deletedId: String(deletedContactLink._id),
    });
  } catch (error) {
    console.error("Permanent contact link delete error:", error);

    return res.status(500).json({
      message: "Failed to permanently delete contact link.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
