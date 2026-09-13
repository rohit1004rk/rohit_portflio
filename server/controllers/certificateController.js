import Certificate from "../models/Certificate.js";

// GET /api/certificates
// Public: certificate list without binary file data
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .select("-data")
      .sort({ createdAt: -1 });

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

    res.set({
      "Content-Type": certificate.contentType,
      "Content-Disposition": `inline; filename="${certificate.filename || "certificate"}"`,
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

    const certificate = await Certificate.create({
      title,
      issuer,
      certificateId,
      category: category || "Certification",
      completionDate,
      description,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer,
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
