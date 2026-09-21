import Resume from "../models/Resume.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

    fileSize: typeof resume.fileSize === "number" ? resume.fileSize : null,

    mimeType: resume.mimeType || "application/pdf",

    uploadedAt: resume.uploadedAt || resume.createdAt || null,

    createdAt: resume.createdAt || null,
    updatedAt: resume.updatedAt || null,

    viewCount: Number(resume.viewCount || 0),
    downloadCount: Number(resume.downloadCount || 0),
  };
};

/* ============================================================
   GET CURRENT RESUME
   Public
   ============================================================ */

export const getCurrentResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      isCurrent: true,
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

/* ============================================================
   GET ALL RESUME VERSIONS
   Admin
   ============================================================ */

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

/* ============================================================
   CREATE / UPLOAD NEW RESUME
   Admin
   ============================================================ */

export const createResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a resume file to upload.",
      });
    }

    const { title = "Resume", setCurrent = "true" } = req.body || {};

    const file = req.file;

    /* --------------------------------------------------------
       File validation
       -------------------------------------------------------- */

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        message:
          "Unsupported resume format. Allowed formats: PDF, JPG, JPEG, PNG and WEBP.",
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        message: "Resume file must be 10 MB or smaller.",
      });
    }

    if (!file.buffer) {
      return res.status(400).json({
        message: "Resume file data is missing.",
      });
    }

    /* --------------------------------------------------------
       Find latest version
       -------------------------------------------------------- */

    const latestResume = await Resume.findOne({})
      .sort({
        version: -1,
      })
      .select("version")
      .lean();

    const nextVersion = Number(latestResume?.version || 0) + 1;

    const shouldSetCurrent = String(setCurrent).toLowerCase() !== "false";

    /* --------------------------------------------------------
       If this becomes current, remove current flag
       from every previous version.
       -------------------------------------------------------- */

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

    /* --------------------------------------------------------
       Create new resume
       -------------------------------------------------------- */

    const resume = await Resume.create({
      title: String(title).trim() || "Resume",

      originalName: file.originalname || `resume-v${nextVersion}`,

      fileUrl: "",

      storageType: "local",

      data: file.buffer,

      version: nextVersion,

      isCurrent: shouldSetCurrent,

      fileSize: file.size,

      mimeType: file.mimetype,

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

/* ============================================================
   SET RESUME AS CURRENT
   Admin
   ============================================================ */

export const setCurrentResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    /* --------------------------------------------------------
       Remove current status from all other versions.
       -------------------------------------------------------- */

    await Resume.updateMany(
      {
        _id: {
          $ne: resume._id,
        },
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

/* ============================================================
   TRACK RESUME VIEW
   Public
   ============================================================ */

export const trackResumeView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    const resume = await Resume.findByIdAndUpdate(
      id,
      {
        $inc: {
          viewCount: 1,
        },
      },
      {
        new: true,
        select: "version isCurrent viewCount",
      },
    ).lean();

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
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

/* ============================================================
   TRACK RESUME DOWNLOAD
   Public
   ============================================================ */

export const trackResumeDownload = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    const resume = await Resume.findByIdAndUpdate(
      id,
      {
        $inc: {
          downloadCount: 1,
        },
      },
      {
        new: true,
        select: "version isCurrent downloadCount",
      },
    ).lean();

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
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

/* ============================================================
   DELETE RESUME
   Admin
   ============================================================ */

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    /* --------------------------------------------------------
       Never allow current resume deletion.
       -------------------------------------------------------- */

    if (resume.isCurrent) {
      return res.status(400).json({
        message:
          "Current resume cannot be deleted. Set another resume as current first.",
      });
    }

    await Resume.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Resume version deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("Delete resume error:", error);

    return res.status(500).json({
      message: "Failed to delete resume.",
    });
  }
};

/* ============================================================
   GET ACTUAL RESUME FILE
   Public
   ============================================================ */

export const getResumeFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Resume ID is required.",
      });
    }

    const resume = await Resume.findById(id)
      .select("+data originalName mimeType fileSize")
      .lean();

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    if (!resume.data) {
      return res.status(404).json({
        message: "Resume file data is not available.",
      });
    }

    const mimeType = resume.mimeType || "application/pdf";

    const originalName = resume.originalName || "resume";

    /* --------------------------------------------------------
       Prevent malformed filename headers.
       -------------------------------------------------------- */

    const safeFileName =
      String(originalName)
        .replace(/[\r\n"]/g, "")
        .trim() || "resume";

    res.set({
      "Content-Type": mimeType,

      "Content-Length": resume.data.length,

      "Content-Disposition": `inline; filename="${safeFileName}"`,

      "Cache-Control": "no-store, max-age=0",
    });

    return res.send(resume.data);
  } catch (error) {
    console.error("Get resume file error:", error);

    return res.status(500).json({
      message: "Failed to fetch resume file.",
    });
  }
};
