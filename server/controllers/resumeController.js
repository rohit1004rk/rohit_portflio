import mongoose from "mongoose";
import Resume from "../models/Resume.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ["application/pdf"];

/*
 * ============================================================
 * VALIDATE MONGODB OBJECT ID
 * ============================================================
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/*
 * ============================================================
 * SANITIZE RESUME
 * ============================================================
 *
 * Actual PDF buffer कभी API response में नहीं भेजा जाएगा.
 * ============================================================
 */
const sanitizeResume = (resume) => {
  if (!resume) return null;

  return {
    _id: resume._id,

    title: resume.title || "Resume",

    originalName: resume.originalName || "Resume",

    fileUrl: resume.fileUrl || "",

    storageType: resume.storageType || "local",

    version: Number(resume.version || 1),

    isCurrent: Boolean(resume.isCurrent),

    isEnabled:
      resume.isEnabled === undefined ? true : Boolean(resume.isEnabled),

    disabledAt: resume.disabledAt || null,

    isDeleted: Boolean(resume.isDeleted),

    deletedAt: resume.deletedAt || null,

    fileSize: typeof resume.fileSize === "number" ? resume.fileSize : null,

    mimeType: resume.mimeType || "application/pdf",

    uploadedAt: resume.uploadedAt || resume.createdAt || null,

    createdAt: resume.createdAt || null,

    updatedAt: resume.updatedAt || null,

    viewCount: Number(resume.viewCount || 0),

    downloadCount: Number(resume.downloadCount || 0),
  };
};

/*
 * ============================================================
 * GET CURRENT RESUME
 * ============================================================
 *
 * Public
 *
 * केवल वही resume public होगा जो:
 *
 * isCurrent  = true
 * isEnabled  = true
 * isDeleted  = false
 * ============================================================
 */
export const getCurrentResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      isCurrent: true,

      isEnabled: {
        $ne: false,
      },

      isDeleted: {
        $ne: true,
      },
    })
      .sort({
        uploadedAt: -1,
        createdAt: -1,
      })
      .lean();

    if (!resume) {
      return res.status(404).json({
        message: "No current resume found.",
        resume: null,
      });
    }

    return res.status(200).json(sanitizeResume(resume));
  } catch (error) {
    console.error("Get current resume error:", error);

    return res.status(500).json({
      message: "Failed to fetch current resume.",
    });
  }
};

/*
 * ============================================================
 * GET ALL RESUME VERSIONS
 * ============================================================
 *
 * Admin
 *
 * Deleted और disabled records भी दिखाई देंगे.
 * ============================================================
 */
export const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({})
      .sort({
        version: -1,
        uploadedAt: -1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json(resumes.map(sanitizeResume));
  } catch (error) {
    console.error("Get resume history error:", error);

    return res.status(500).json({
      message: "Failed to fetch resume history.",
    });
  }
};

/*
 * ============================================================
 * CREATE / UPLOAD NEW RESUME
 * ============================================================
 *
 * Admin
 *
 * केवल PDF accepted.
 * ============================================================
 */
export const createResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a resume PDF to upload.",
      });
    }

    const { title = "Resume", setCurrent = "true" } = req.body || {};

    const file = req.file;

    /*
     * ----------------------------------------------------------
     * FILE TYPE
     * ----------------------------------------------------------
     */
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        message: "Unsupported resume format. Only PDF files are allowed.",
      });
    }

    /*
     * ----------------------------------------------------------
     * FILE SIZE
     * ----------------------------------------------------------
     */
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        message: "Resume file must be 10 MB or smaller.",
      });
    }

    /*
     * ----------------------------------------------------------
     * FILE BUFFER
     * ----------------------------------------------------------
     */
    if (!file.buffer) {
      return res.status(400).json({
        message: "Resume file data is missing.",
      });
    }

    /*
     * ----------------------------------------------------------
     * FIND LATEST VERSION
     * ----------------------------------------------------------
     *
     * Deleted versions भी count होंगे.
     * Version number कभी reuse नहीं होगा.
     */
    const latestResume = await Resume.findOne({})
      .sort({
        version: -1,
      })
      .select("version")
      .lean();

    const nextVersion = Number(latestResume?.version || 0) + 1;

    const shouldSetCurrent = String(setCurrent).toLowerCase() !== "false";

    /*
     * ----------------------------------------------------------
     * REMOVE CURRENT STATUS
     * ----------------------------------------------------------
     */
    if (shouldSetCurrent) {
      await Resume.updateMany(
        {
          isCurrent: true,
        },
        {
          $set: {
            isCurrent: false,
          },
        },
      );
    }

    /*
     * ----------------------------------------------------------
     * CREATE RESUME
     * ----------------------------------------------------------
     */
    const resume = await Resume.create({
      title: String(title).trim() || "Resume",

      originalName: file.originalname || `resume-v${nextVersion}.pdf`,

      fileUrl: "",

      storageType: "local",

      data: file.buffer,

      version: nextVersion,

      isCurrent: shouldSetCurrent,

      isEnabled: true,

      disabledAt: null,

      isDeleted: false,

      deletedAt: null,

      fileSize: file.size,

      mimeType: "application/pdf",

      uploadedAt: new Date(),

      viewCount: 0,

      downloadCount: 0,
    });

    return res.status(201).json(sanitizeResume(resume.toObject()));
  } catch (error) {
    console.error("Create resume error:", error);

    return res.status(500).json({
      message: error?.message || "Failed to upload resume.",
    });
  }
};

/*
 * ============================================================
 * EDIT RESUME
 * ============================================================
 *
 * Admin
 *
 * फिलहाल केवल title editable है.
 *
 * Original PDF/file data को touch नहीं किया जाएगा.
 * ============================================================
 */
export const updateResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    /*
     * Deleted resume को edit नहीं करेंगे.
     */
    if (resume.isDeleted) {
      return res.status(400).json({
        message: "Deleted resume cannot be edited.",
      });
    }

    const { title } = req.body || {};

    /*
     * Title update
     */
    if (title !== undefined) {
      const cleanTitle = String(title).trim();

      if (!cleanTitle) {
        return res.status(400).json({
          message: "Resume title cannot be empty.",
        });
      }

      if (cleanTitle.length > 200) {
        return res.status(400).json({
          message: "Resume title cannot exceed 200 characters.",
        });
      }

      resume.title = cleanTitle;
    }

    await resume.save();

    return res.status(200).json({
      message: "Resume updated successfully.",

      resume: sanitizeResume(resume.toObject()),
    });
  } catch (error) {
    console.error("Update resume error:", error);

    return res.status(500).json({
      message: "Failed to update resume.",
    });
  }
};

/*
 * ============================================================
 * ENABLE RESUME
 * ============================================================
 *
 * Admin
 *
 * Disabled resume को वापस enable किया जा सकता है.
 * ============================================================
 */
export const enableResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    if (resume.isDeleted) {
      return res.status(400).json({
        message: "Deleted resume cannot be enabled. Restore it first.",
      });
    }

    if (resume.isEnabled !== false) {
      return res.status(200).json({
        message: "Resume is already enabled.",

        resume: sanitizeResume(resume.toObject()),
      });
    }

    resume.isEnabled = true;

    resume.disabledAt = null;

    await resume.save();

    return res.status(200).json({
      message: "Resume enabled successfully.",

      resume: sanitizeResume(resume.toObject()),
    });
  } catch (error) {
    console.error("Enable resume error:", error);

    return res.status(500).json({
      message: "Failed to enable resume.",
    });
  }
};

/*
 * ============================================================
 * DISABLE RESUME
 * ============================================================
 *
 * Admin
 *
 * Current resume को disable नहीं किया जाएगा.
 *
 * क्योंकि current resume disable करने पर public portfolio
 * पर live resume नहीं रहेगा.
 * ============================================================
 */
export const disableResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    if (resume.isDeleted) {
      return res.status(400).json({
        message: "Deleted resume cannot be disabled.",
      });
    }

    /*
     * Current resume protection
     */
    if (resume.isCurrent) {
      return res.status(400).json({
        message:
          "Current resume cannot be disabled. Set another resume as current first.",
      });
    }

    if (resume.isEnabled === false) {
      return res.status(200).json({
        message: "Resume is already disabled.",

        resume: sanitizeResume(resume.toObject()),
      });
    }

    resume.isEnabled = false;

    resume.disabledAt = new Date();

    await resume.save();

    return res.status(200).json({
      message: "Resume disabled successfully.",

      resume: sanitizeResume(resume.toObject()),
    });
  } catch (error) {
    console.error("Disable resume error:", error);

    return res.status(500).json({
      message: "Failed to disable resume.",
    });
  }
};

/*
 * ============================================================
 * SET RESUME AS CURRENT
 * ============================================================
 *
 * Admin
 *
 * Deleted या disabled resume current नहीं बन सकता.
 * पहले Enable करना होगा.
 * ============================================================
 */
export const setCurrentResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    /*
     * Deleted version
     */
    if (resume.isDeleted) {
      return res.status(400).json({
        message: "Deleted resume cannot be set as current. Restore it first.",
      });
    }

    /*
     * Disabled version
     */
    if (resume.isEnabled === false) {
      return res.status(400).json({
        message: "Disabled resume cannot be set as current. Enable it first.",
      });
    }

    /*
     * Remove current status from all others.
     */
    await Resume.updateMany(
      {
        _id: {
          $ne: resume._id,
        },

        isCurrent: true,
      },
      {
        $set: {
          isCurrent: false,
        },
      },
    );

    resume.isCurrent = true;

    await resume.save();

    return res.status(200).json({
      message: "Current resume updated successfully.",

      resume: sanitizeResume(resume.toObject()),
    });
  } catch (error) {
    console.error("Set current resume error:", error);

    return res.status(500).json({
      message: "Failed to set current resume.",
    });
  }
};

/*
 * ============================================================
 * TRACK RESUME VIEW
 * ============================================================
 *
 * Public
 *
 * केवल enabled + non-deleted resume track होगा.
 * ============================================================
 */
export const trackResumeView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findOneAndUpdate(
      {
        _id: id,

        isEnabled: {
          $ne: false,
        },

        isDeleted: {
          $ne: true,
        },
      },
      {
        $inc: {
          viewCount: 1,
        },
      },
      {
        new: true,

        select: "version isCurrent isEnabled isDeleted viewCount",
      },
    ).lean();

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found or is no longer available.",
      });
    }

    return res.status(200).json({
      message: "Resume view tracked.",

      viewCount: Number(resume.viewCount || 0),
    });
  } catch (error) {
    console.error("Track resume view error:", error);

    return res.status(500).json({
      message: "Failed to track resume view.",
    });
  }
};

/*
 * ============================================================
 * TRACK RESUME DOWNLOAD
 * ============================================================
 *
 * Public
 * ============================================================
 */
export const trackResumeDownload = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findOneAndUpdate(
      {
        _id: id,

        isEnabled: {
          $ne: false,
        },

        isDeleted: {
          $ne: true,
        },
      },
      {
        $inc: {
          downloadCount: 1,
        },
      },
      {
        new: true,

        select: "version isCurrent isEnabled isDeleted downloadCount",
      },
    ).lean();

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found or is no longer available.",
      });
    }

    return res.status(200).json({
      message: "Resume download tracked.",

      downloadCount: Number(resume.downloadCount || 0),
    });
  } catch (error) {
    console.error("Track resume download error:", error);

    return res.status(500).json({
      message: "Failed to track resume download.",
    });
  }
};

/*
 * ============================================================
 * SOFT DELETE RESUME
 * ============================================================
 *
 * Admin
 *
 * Database record और PDF सुरक्षित रहेंगे.
 *
 * यह Delete option है.
 * ============================================================
 */
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    /*
     * Current resume protection
     */
    if (resume.isCurrent) {
      return res.status(400).json({
        message:
          "Current resume cannot be deleted. Set another resume as current first.",
      });
    }

    /*
     * Already deleted
     */
    if (resume.isDeleted) {
      return res.status(400).json({
        message: "This resume version is already in deleted history.",
      });
    }

    /*
     * Soft delete
     */
    resume.isDeleted = true;

    resume.deletedAt = new Date();

    /*
     * Deleted resume public नहीं रहेगा.
     */
    resume.isEnabled = false;

    resume.disabledAt = resume.disabledAt || new Date();

    await resume.save();

    return res.status(200).json({
      message: "Resume version moved to deleted history.",

      deletedId: id,

      resume: sanitizeResume(resume.toObject()),
    });
  } catch (error) {
    console.error("Delete resume error:", error);

    return res.status(500).json({
      message: "Failed to delete resume.",
    });
  }
};

/*
 * ============================================================
 * PERMANENT DELETE RESUME
 * ============================================================
 *
 * Admin
 *
 * IMPORTANT:
 *
 * यह actual MongoDB DELETE है.
 *
 * Document + stored PDF buffer दोनों permanently हटेंगे.
 *
 * Current resume को कभी permanently delete नहीं किया जा सकता.
 * ============================================================
 */
export const permanentlyDeleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        message:
          "Resume not found. It may already have been permanently deleted.",
      });
    }

    /*
     * Current resume protection
     */
    if (resume.isCurrent) {
      return res.status(400).json({
        message:
          "Current resume cannot be permanently deleted. Set another resume as current first.",
      });
    }

    /*
     * Actual MongoDB deletion
     *
     * इसमें:
     * - MongoDB document
     * - stored PDF Buffer
     * - metadata
     * सब permanently remove होंगे.
     */
    const deleteResult = await Resume.deleteOne({
      _id: resume._id,
    });

    if (deleteResult.deletedCount !== 1) {
      return res.status(500).json({
        message: "Permanent deletion could not be confirmed.",
      });
    }

    return res.status(200).json({
      message: "Resume permanently deleted from MongoDB.",

      deletedId: id,

      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Permanent delete resume error:", error);

    return res.status(500).json({
      message: "Failed to permanently delete resume.",
    });
  }
};

/*
 * ============================================================
 * GET ACTUAL RESUME FILE
 * ============================================================
 *
 * Public
 *
 * Deleted या disabled resume का PDF public नहीं मिलेगा.
 * ============================================================
 */
export const getResumeFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid Resume ID.",
      });
    }

    const resume = await Resume.findOne({
      _id: id,

      isEnabled: {
        $ne: false,
      },

      isDeleted: {
        $ne: true,
      },
    })
      .select("+data originalName mimeType fileSize")
      .lean();

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found or is no longer available.",
      });
    }

    if (!resume.data) {
      return res.status(404).json({
        message: "Resume file data is not available.",
      });
    }

    /*
     * ========================================================
     * NORMALIZE BUFFER
     * ========================================================
     */
    let pdfBuffer;

    if (Buffer.isBuffer(resume.data)) {
      pdfBuffer = resume.data;
    } else if (resume.data?.buffer) {
      pdfBuffer = Buffer.from(resume.data.buffer);
    } else {
      pdfBuffer = Buffer.from(resume.data);
    }

    if (!pdfBuffer.length) {
      return res.status(404).json({
        message: "Resume PDF data is empty.",
      });
    }

    const mimeType = resume.mimeType || "application/pdf";

    const originalName = resume.originalName || "resume.pdf";

    /*
     * Prevent malformed filename headers.
     */
    const safeFileName =
      String(originalName)
        .replace(/[\r\n"]/g, "")
        .trim() || "resume.pdf";

    res.set({
      "Content-Type": mimeType,

      "Content-Length": String(pdfBuffer.length),

      "Content-Disposition": `inline; filename="${safeFileName}"`,

      "Cache-Control": "no-store, max-age=0",

      "X-Content-Type-Options": "nosniff",
    });

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Get resume file error:", error);

    return res.status(500).json({
      message: "Failed to fetch resume file.",
    });
  }
};
