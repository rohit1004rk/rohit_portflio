import Message from "../models/Message.js";
import ChatLog from "../models/ChatLog.js";
import AnalyticsEvent from "../models/AnalyticsEvent.js";

// @desc    Get admin dashboard stats + analytics overview
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const now = new Date();

    // Analytics window: last 30 minutes for live activity
    const liveWindowStart = new Date(now.getTime() - 30 * 60 * 1000);

    // General analytics window: last 30 days
    const analyticsWindowStart = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    );

    const [
      totalMessages,
      unreadMessages,
      totalChats,
      recentMessages,
      recentChats,

      totalAnalyticsEvents,
      totalVisitors,
      totalSessions,
      totalPageViews,

      liveVisitors,
      liveEvents,
      topPages,
      trafficSources,
      deviceBreakdown,
      recentAnalyticsEvents,
    ] = await Promise.all([
      // Existing dashboard data
      Message.countDocuments(),

      Message.countDocuments({
        read: false,
      }),

      ChatLog.countDocuments(),

      Message.find().sort({ createdAt: -1 }).limit(6).lean(),

      ChatLog.find().sort({ createdAt: -1 }).limit(6).lean(),

      // Total analytics events in last 30 days
      AnalyticsEvent.countDocuments({
        occurredAt: {
          $gte: analyticsWindowStart,
        },
      }),

      // Unique visitors in last 30 days
      AnalyticsEvent.distinct("visitorId", {
        occurredAt: {
          $gte: analyticsWindowStart,
        },
      }),

      // Unique sessions in last 30 days
      AnalyticsEvent.distinct("sessionId", {
        occurredAt: {
          $gte: analyticsWindowStart,
        },
      }),

      // Page views in last 30 days
      AnalyticsEvent.countDocuments({
        event: "page_view",
        occurredAt: {
          $gte: analyticsWindowStart,
        },
      }),

      // Unique visitors active during last 30 minutes
      AnalyticsEvent.distinct("visitorId", {
        occurredAt: {
          $gte: liveWindowStart,
        },
      }),

      // Events during last 30 minutes
      AnalyticsEvent.countDocuments({
        occurredAt: {
          $gte: liveWindowStart,
        },
      }),

      // Most viewed pages during last 30 days
      AnalyticsEvent.aggregate([
        {
          $match: {
            event: "page_view",
            occurredAt: {
              $gte: analyticsWindowStart,
            },
            page: {
              $nin: ["", null],
            },
          },
        },
        {
          $group: {
            _id: "$page",
            views: {
              $sum: 1,
            },
            uniqueVisitors: {
              $addToSet: "$visitorId",
            },
          },
        },
        {
          $project: {
            _id: 0,
            page: "$_id",
            views: 1,
            uniqueVisitors: {
              $size: "$uniqueVisitors",
            },
          },
        },
        {
          $sort: {
            views: -1,
          },
        },
        {
          $limit: 10,
        },
      ]),

      // Traffic sources during last 30 days
      AnalyticsEvent.aggregate([
        {
          $match: {
            occurredAt: {
              $gte: analyticsWindowStart,
            },
          },
        },
        {
          $group: {
            _id: {
              $ifNull: ["$source.type", "direct"],
            },
            events: {
              $sum: 1,
            },
            uniqueVisitors: {
              $addToSet: "$visitorId",
            },
          },
        },
        {
          $project: {
            _id: 0,
            source: "$_id",
            events: 1,
            uniqueVisitors: {
              $size: "$uniqueVisitors",
            },
          },
        },
        {
          $sort: {
            events: -1,
          },
        },
        {
          $limit: 10,
        },
      ]),

      // Device breakdown during last 30 days
      AnalyticsEvent.aggregate([
        {
          $match: {
            occurredAt: {
              $gte: analyticsWindowStart,
            },
          },
        },
        {
          $group: {
            _id: {
              $ifNull: ["$device.type", "unknown"],
            },
            events: {
              $sum: 1,
            },
            uniqueVisitors: {
              $addToSet: "$visitorId",
            },
          },
        },
        {
          $project: {
            _id: 0,
            device: "$_id",
            events: 1,
            uniqueVisitors: {
              $size: "$uniqueVisitors",
            },
          },
        },
        {
          $sort: {
            events: -1,
          },
        },
      ]),

      // Recent analytics activity
      AnalyticsEvent.find()
        .sort({ occurredAt: -1 })
        .limit(20)
        .select(
          "event visitorId sessionId page entity source.type device.type occurredAt",
        )
        .lean(),
    ]);

    res.json({
      // Existing fields — preserved for current Dashboard
      totalMessages,
      unreadMessages,
      totalChats,
      recentMessages,
      recentChats,

      // Analytics overview
      analytics: {
        available: totalAnalyticsEvents > 0,

        period: {
          name: "last_30_days",
          start: analyticsWindowStart,
          end: now,
        },

        totalEvents: totalAnalyticsEvents,

        totalVisitors: totalVisitors.length,

        totalSessions: totalSessions.length,

        totalPageViews,

        live: {
          available: liveVisitors.length > 0 || liveEvents > 0,
          activeVisitors: liveVisitors.length,
          eventsLast30Minutes: liveEvents,
          windowMinutes: 30,
        },

        topPages,

        trafficSources,

        devices: deviceBreakdown,

        recentEvents: recentAnalyticsEvents,
      },

      // Useful timestamp for Dashboard refresh indicator
      generatedAt: now,
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);

    res.status(500).json({
      message: "Failed to load admin dashboard statistics.",
      error: error.message,
    });
  }
};
