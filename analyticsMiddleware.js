const TRACKER_URL = "https://analytics-tracker.nhutnm2306.workers.dev/collect";

function trackRequest(siteId) {
  return (req, res, next) => {
    try {
      fetch(TRACKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site: siteId,
          path: req.path,
          ua: req.headers["user-agent"],
        }),
      }).catch(() => {});
    } catch (err) {
      // fetch không khả dụng hoặc lỗi mạng - bỏ qua, không chặn request chính
    }
    next();
  };
}

module.exports = trackRequest;
