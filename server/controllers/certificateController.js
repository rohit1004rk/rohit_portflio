import mongoose from "mongoose";
import Certificate from "../models/Certificate.js";

// GET /api/certificates
// Public: certificate list without binary file data
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .select("-data")
      .sort({ order: 1, createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({
      message: "Failed to fetch certificates",
    });
  }
};

// GET /api/certificates/:id/file
// Public: open/download the actual certificate file
export const getCertificateFile = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    // Sanitize the stored filename before using it in an HTTP header.
    const safeFilename =
      String(certificate.filename || "certificate")
        .replace(/[\r\n"]/g, "")
        .replace(/[\\/]/g, "_")
        .trim() || "certificate";

    res.set({
      "Content-Type": certificate.contentType,
      "Content-Disposition": `inline; filename="${safeFilename}"`,
      "Cache-Control": "public, max-age=31536000",
    });

    res.send(certificate.data);
  } catch (error) {
    console.error("Get certificate file error:", error);
    res.status(500).json({
      message: "Failed to open certificate",
    });
  }
};

// POST /api/certificates
// Admin: upload a new certificate
export const createCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Certificate file is required",
      });
    }

    const {
      title,
      issuer,
      certificateId,
      category,
      completionDate,
      description,
    } = req.body;

    if (!title || !issuer) {
      return res.status(400).json({
        message: "Title and issuer are required",
      });
    }

    // Put newly uploaded certificates at the end of the current order.
    const lastCertificate = await Certificate.findOne()
      .sort({ order: -1 })
      .select("order");

    const nextOrder =
      lastCertificate && Number.isFinite(Number(lastCertificate.order))
        ? Number(lastCertificate.order) + 1
        : 1;

    const certificate = await Certificate.create({
      title: title.trim(),
      issuer: issuer.trim(),
      certificateId:
        typeof certificateId === "string" ? certificateId.trim() : "",
      category:
        typeof category === "string" && category.trim()
          ? category.trim()
          : "Certification",
      completionDate:
        typeof completionDate === "string" ? completionDate.trim() : "",
      description: typeof description === "string" ? description.trim() : "",
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
      order: nextOrder,
    });

    res.status(201).json({
      message: "Certificate uploaded successfully",
      certificate: {
        ...certificate.toObject(),
        data: undefined,
      },
    });
  } catch (error) {
    console.error("Create certificate error:", error);
    res.status(500).json({
      message: "Failed to upload certificate",
    });
  }
};

// PUT /api/certificates/:id
// Admin: update certificate metadata and optionally replace the file
export const updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    const {
      title,
      issuer,
      certificateId,
      category,
      completionDate,
      description,
    } = req.body;

    // Title is required when updating.
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Certificate title is required",
        });
      }

      certificate.title = title.trim();
    }

    // Issuer is required when updating.
    if (issuer !== undefined) {
      if (typeof issuer !== "string" || !issuer.trim()) {
        return res.status(400).json({
          message: "Certificate issuer is required",
        });
      }

      certificate.issuer = issuer.trim();
    }

    if (certificateId !== undefined) {
      certificate.certificateId =
        typeof certificateId === "string" ? certificateId.trim() : "";
    }

    if (category !== undefined) {
      certificate.category =
        typeof category === "string" && category.trim()
          ? category.trim()
          : "Certification";
    }

    if (completionDate !== undefined) {
      certificate.completionDate =
        typeof completionDate === "string" ? completionDate.trim() : "";
    }

    if (description !== undefined) {
      certificate.description =
        typeof description === "string" ? description.trim() : "";
    }

    // File replacement is optional during edit.
    // If no new file is provided, the existing file remains unchanged.
    if (req.file) {
      certificate.filename = req.file.originalname;
      certificate.contentType = req.file.mimetype;
      certificate.data = req.file.buffer;
    }

    await certificate.save();

    res.json({
      message: "Certificate updated successfully",
      certificate: {
        ...certificate.toObject(),
        data: undefined,
      },
    });
  } catch (error) {
    console.error("Update certificate error:", error);
    res.status(500).json({
      message: "Failed to update certificate",
    });
  }
};

// PUT /api/certificates/reorder
// Admin: save certificate display order
export const reorderCertificates = async (req, res) => {
  try {
    const { certificateIds } = req.body;

    if (!Array.isArray(certificateIds)) {
      return res.status(400).json({
        message: "certificateIds must be an array",
      });
    }

    if (certificateIds.length === 0) {
      return res.status(400).json({
        message: "Certificate order cannot be empty",
      });
    }

    // Prevent unnecessarily large requests.
    if (certificateIds.length > 1000) {
      return res.status(400).json({
        message: "Too many certificates in reorder request",
      });
    }

    // Validate every MongoDB ObjectId.
    const invalidIds = certificateIds.filter(
      (id) => !mongoose.isValidObjectId(id),
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "One or more certificate IDs are invalid",
      });
    }

    // Prevent duplicate IDs.
    const uniqueIds = new Set(certificateIds.map((id) => String(id)));

    if (uniqueIds.size !== certificateIds.length) {
      return res.status(400).json({
        message: "Duplicate certificate IDs are not allowed",
      });
    }

    // Make sure the request contains the complete certificate list.
    const existingCertificates = await Certificate.find().select("_id").lean();

    if (existingCertificates.length !== certificateIds.length) {
      return res.status(400).json({
        message: "Certificate order must include every certificate",
      });
    }

    const existingIds = new Set(
      existingCertificates.map((certificate) => String(certificate._id)),
    );

    const containsUnknownId = certificateIds.some(
      (id) => !existingIds.has(String(id)),
    );

    if (containsUnknownId) {
      return res.status(400).json({
        message: "Certificate order contains an unknown certificate",
      });
    }

    // Update ONLY the order field.
    const operations = certificateIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            order: index + 1,
          },
        },
      },
    }));

    await Certificate.bulkWrite(operations);

    const certificates = await Certificate.find()
      .select("-data")
      .sort({ order: 1, createdAt: -1 });

    res.json({
      message: "Certificate order saved successfully",
      certificates,
    });
  } catch (error) {
    console.error("Reorder certificates error:", error);
    res.status(500).json({
      message: "Failed to save certificate order",
    });
  }
};

// DELETE /api/certificates/:id
// Admin: delete a certificate
export const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    res.json({
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Delete certificate error:", error);
    res.status(500).json({
      message: "Failed to delete certificate",
    });
  }
};
