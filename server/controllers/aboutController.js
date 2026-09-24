import About from "../models/About.js";

const defaultAbout = {
  hero: {
    enabled: true,
    eyebrow: "ABOUT",
    title: "Turning problems into software",
    lead: "I'm Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions.",
  },

  introduction: {
    enabled: true,

    paragraph1:
      "I'm Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions. I work across modern web technologies, REST APIs, databases, NLP, and computer vision.",

    paragraph2:
      "I enjoy turning practical problems into functional software—from e-commerce platforms and campus utility applications to machine-learning systems for fake-news and spam detection.",

    paragraph3:
      "My goal is to continuously strengthen my development and AI/ML skills and use my projects to demonstrate practical problem-solving ability to recruiters and potential clients.",
  },

  focusCards: {
    enabled: true,

    items: [
      {
        title: "Who I Am",
        icon: "👤",
        description:
          "A Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions.",
        enabled: true,
        order: 1,
      },
      {
        title: "What I Build",
        icon: "🛠️",
        description:
          "Modern web applications, REST APIs, databases, NLP systems, and computer-vision prototypes that turn practical problems into functional software.",
        enabled: true,
        order: 2,
      },
      {
        title: "Full Stack Focus",
        icon: "⚙️",
        description:
          "React frontends, Node.js/Express backends, MongoDB data modeling, JWT authentication, and role-based authorization across the stack.",
        enabled: true,
        order: 3,
      },
      {
        title: "AI/ML Focus",
        icon: "🤖",
        description:
          "Text classification, NLP, computer vision, and speaker recognition—from classical ML baselines to BERT and CNN-based deep learning.",
        enabled: true,
        order: 4,
      },
      {
        title: "Career Direction",
        icon: "🚀",
        description:
          "Continuously strengthening development and AI/ML skills, and using projects to demonstrate practical problem-solving ability to recruiters and potential clients.",
        enabled: true,
        order: 5,
      },
    ],
  },

  visibility: {
    hero: true,
    introduction: true,
    focusCards: true,
  },
};

export const getAbout = async (req, res) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = await About.create(defaultAbout);
    }

    res.json(about);
  } catch (error) {
    console.error("Get about error:", error);

    res.status(500).json({
      message: "Failed to load about content",
    });
  }
};

export const getAdminAbout = async (req, res) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = await About.create(defaultAbout);
    }

    res.json(about);
  } catch (error) {
    console.error("Get admin about error:", error);

    res.status(500).json({
      message: "Failed to load about settings",
    });
  }
};

export const updateAbout = async (req, res) => {
  try {
    let about = await About.findOne();

    if (!about) {
      about = await About.create(defaultAbout);
    }

    const { hero, introduction, focusCards, visibility } = req.body;

    if (hero) {
      about.hero = {
        ...about.hero.toObject(),
        ...hero,
      };
    }

    if (introduction) {
      about.introduction = {
        ...about.introduction.toObject(),
        ...introduction,
      };
    }

    if (focusCards) {
      about.focusCards = {
        ...about.focusCards.toObject(),
        ...focusCards,
      };
    }

    if (visibility) {
      about.visibility = {
        ...about.visibility.toObject(),
        ...visibility,
      };
    }

    await about.save();

    res.json({
      message: "About settings updated successfully",
      about,
    });
  } catch (error) {
    console.error("Update about error:", error);

    res.status(500).json({
      message: "Failed to update about settings",
    });
  }
};
