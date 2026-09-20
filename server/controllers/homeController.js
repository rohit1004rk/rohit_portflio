import Home from "../models/Home.js";

const defaultHome = {
  hero: {
    eyebrow: "FULL STACK + AI/ML DEVELOPER",
    name: "Rohit Kumar",
    role: "Full Stack + AI/ML",
    description: "",
    primaryButtonText: "View Projects",
    primaryButtonLink: "/projects",
    secondaryButtonText: "Contact Me",
    secondaryButtonLink: "/contact",
  },

  codeShowcase: {
    enabled: true,
    captionName: "Rohit Kumar",
    captionRole: "Full Stack + AI/ML Developer",
    snippets: [],
  },

  featuredProjects: {
    enabled: true,
    limit: 2,
  },
};

export const getHome = async (req, res) => {
  try {
    let home = await Home.findOne();

    if (!home) {
      home = await Home.create(defaultHome);
    }

    res.json(home);
  } catch (error) {
    console.error("Get home error:", error);
    res.status(500).json({
      message: "Failed to load home settings",
    });
  }
};

export const getAdminHome = async (req, res) => {
  try {
    let home = await Home.findOne();

    if (!home) {
      home = await Home.create(defaultHome);
    }

    res.json(home);
  } catch (error) {
    console.error("Get admin home error:", error);
    res.status(500).json({
      message: "Failed to load home settings",
    });
  }
};

export const updateHome = async (req, res) => {
  try {
    let home = await Home.findOne();

    if (!home) {
      home = await Home.create(defaultHome);
    }

    const { hero, codeShowcase, featuredProjects } = req.body;

    if (hero) {
      home.hero = {
        ...home.hero.toObject(),
        ...hero,
      };
    }

    if (codeShowcase) {
      home.codeShowcase = {
        ...home.codeShowcase.toObject(),
        ...codeShowcase,
      };
    }

    if (featuredProjects) {
      home.featuredProjects = {
        ...home.featuredProjects.toObject(),
        ...featuredProjects,
      };
    }

    await home.save();

    res.json({
      message: "Home settings updated successfully",
      home,
    });
  } catch (error) {
    console.error("Update home error:", error);
    res.status(500).json({
      message: "Failed to update home settings",
    });
  }
};

