import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    /**
     * Unique event identifier.
     *
     * Examples:
     * page_view
     * session_start
     * project_view
     * project_github_click
     * project_demo_click
     * resume_view
     * resume_download
     * contact_page_view
     * contact_form_start
     * contact_form_submit
     * github_click
     * linkedin_click
     * youtube_click
     * instagram_click
     * email_click
     * cta_click
     * external_link_click
     * scroll_depth
     */
    event: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    /**
     * Anonymous visitor identifier.
     *
     * This is NOT an email, name, or account identifier.
     * It is generated on the client for analytics purposes.
     */
    visitorId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },

    /**
     * Anonymous browsing session identifier.
     */
    sessionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      index: true,
    },

    /**
     * Current portfolio route/page.
     *
     * Examples:
     * /
     * /about
     * /projects
     * /projects/fake-news-detector
     * /resume
     * /contact
     */
    page: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
      index: true,
    },

    /**
     * Optional entity information.
     *
     * Example:
     * {
     *   type: "project",
     *   id: "...",
     *   slug: "fake-news-detector"
     * }
     */
    entity: {
      type: {
        type: String,
        trim: true,
        maxlength: 50,
        default: null,
      },

      id: {
        type: String,
        trim: true,
        maxlength: 128,
        default: null,
      },

      slug: {
        type: String,
        trim: true,
        maxlength: 200,
        default: null,
      },
    },

    /**
     * Traffic source information.
     *
     * Captured from referrer / UTM parameters when available.
     */
    source: {
      type: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "direct",
        index: true,
      },

      medium: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
      },

      campaign: {
        type: String,
        trim: true,
        maxlength: 200,
        default: null,
      },

      content: {
        type: String,
        trim: true,
        maxlength: 200,
        default: null,
      },

      term: {
        type: String,
        trim: true,
        maxlength: 200,
        default: null,
      },

      referrer: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: null,
      },
    },

    /**
     * Anonymous device information.
     */
    device: {
      type: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "unknown"],
        default: "unknown",
        index: true,
      },

      browser: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "unknown",
      },

      os: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "unknown",
      },

      screenWidth: {
        type: Number,
        min: 0,
        max: 10000,
        default: null,
      },

      screenHeight: {
        type: Number,
        min: 0,
        max: 10000,
        default: null,
      },
    },

    /**
     * Aggregate geographic information only.
     *
     * Do not store precise visitor addresses here.
     */
    location: {
      country: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
      },

      region: {
        type: String,
        trim: true,
        maxlength: 150,
        default: null,
      },

      city: {
        type: String,
        trim: true,
        maxlength: 150,
        default: null,
      },
    },

    /**
     * Optional event-specific data.
     *
     * Examples:
     *
     * {
     *   button: "Download Resume"
     * }
     *
     * {
     *   depth: 75
     * }
     *
     * {
     *   externalUrl: "https://github.com/..."
     * }
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /**
     * Event timestamp.
     *
     * Stored explicitly so analytics can query historical
     * date ranges efficiently.
     */
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

/**
 * Common analytics queries.
 */
analyticsEventSchema.index({
  event: 1,
  occurredAt: -1,
});

analyticsEventSchema.index({
  visitorId: 1,
  occurredAt: -1,
});

analyticsEventSchema.index({
  sessionId: 1,
  occurredAt: -1,
});

analyticsEventSchema.index({
  page: 1,
  occurredAt: -1,
});

analyticsEventSchema.index({
  "source.type": 1,
  occurredAt: -1,
});

analyticsEventSchema.index({
  "entity.type": 1,
  "entity.id": 1,
  occurredAt: -1,
});

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);
