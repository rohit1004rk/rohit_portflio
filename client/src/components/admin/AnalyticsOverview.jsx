function AnalyticsOverview({ analytics }) {
  if (!analytics) {
    return null;
  }

  const {
    available,
    totalEvents = 0,
    totalVisitors = 0,
    totalSessions = 0,
    totalPageViews = 0,
    live,
    topPages = [],
    trafficSources = [],
    devices = [],
    recentEvents = [],
  } = analytics;

  if (!available) {
    return (
      <section className="admin-panel">
        <h2>📊 Analytics Overview</h2>
        <p className="admin-empty">No analytics data available yet.</p>
      </section>
    );
  }

  return (
    <>
      {/* Analytics summary */}
      <section className="admin-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ marginBottom: "6px" }}>📊 Analytics Overview</h2>
            <p className="admin-empty">
              Real portfolio activity from the last 30 days.
            </p>
          </div>

          <span className="badge badge-completed">Live monitoring enabled</span>
        </div>

        <div className="admin-stats">
          <div className="admin-stat">
            <div className="val">{totalVisitors}</div>
            <div className="lab">Unique Visitors</div>
          </div>

          <div className="admin-stat">
            <div className="val">{totalSessions}</div>
            <div className="lab">Sessions</div>
          </div>

          <div className="admin-stat">
            <div className="val">{totalPageViews}</div>
            <div className="lab">Page Views</div>
          </div>

          <div className="admin-stat">
            <div className="val">{totalEvents}</div>
            <div className="lab">Total Events</div>
          </div>

          <div className="admin-stat">
            <div className="val" style={{ color: "var(--teal)" }}>
              {live?.activeVisitors ?? 0}
            </div>
            <div className="lab">Active Now</div>
          </div>
        </div>
      </section>

      {/* Top pages */}
      <section className="admin-panel">
        <h2>📄 Top Pages</h2>

        {topPages.length === 0 ? (
          <p className="admin-empty">No page-view data available.</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Views</th>
                  <th>Visitors</th>
                </tr>
              </thead>

              <tbody>
                {topPages.map((item) => (
                  <tr key={item.page}>
                    <td className="row-title">{item.page}</td>
                    <td>{item.views}</td>
                    <td>{item.uniqueVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Traffic sources */}
      <section className="admin-panel">
        <h2>🌐 Traffic Sources</h2>

        {trafficSources.length === 0 ? (
          <p className="admin-empty">No traffic-source data available.</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Events</th>
                  <th>Visitors</th>
                </tr>
              </thead>

              <tbody>
                {trafficSources.map((item) => (
                  <tr key={item.source}>
                    <td className="row-title">{item.source}</td>
                    <td>{item.events}</td>
                    <td>{item.uniqueVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Device breakdown */}
      <section className="admin-panel">
        <h2>💻 Devices</h2>

        {devices.length === 0 ? (
          <p className="admin-empty">No device data available.</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Events</th>
                  <th>Visitors</th>
                </tr>
              </thead>

              <tbody>
                {devices.map((item) => (
                  <tr key={item.device}>
                    <td className="row-title">{item.device}</td>
                    <td>{item.events}</td>
                    <td>{item.uniqueVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="admin-panel">
        <h2>⚡ Recent Activity</h2>

        {recentEvents.length === 0 ? (
          <p className="admin-empty">No recent analytics activity.</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Page</th>
                  <th>Device</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {recentEvents.map((item, index) => (
                  <tr
                    key={
                      item._id || `${item.event}-${item.occurredAt}-${index}`
                    }
                  >
                    <td className="row-title">{item.event}</td>

                    <td>{item.page || "—"}</td>

                    <td>{item.device?.type || "unknown"}</td>

                    <td>
                      {item.occurredAt
                        ? new Date(item.occurredAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default AnalyticsOverview;
