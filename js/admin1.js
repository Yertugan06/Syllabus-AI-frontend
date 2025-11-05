// ==========================================
// Admin Panel Functionality
// ==========================================
$(document).ready(function () {
  if (!requireAdmin()) return;

  loadAdminStats();
});

function loadAdminStats() {
  // Load upload count
  AdminAPI.getStats("uploads")
    .done(function (data) {
      $("#uploadCount").text(data.count || 0);
    })
    .fail(function () {
      $("#uploadCount").text("N/A");
    });

  // Load users count
  AdminAPI.getStats("users")
    .done(function (data) {
      $("#usersCount").text(data.count || 0);
    })
    .fail(function () {
      $("#usersCount").text("N/A");
    });

  // Load errors count
  AdminAPI.getStats("errors")
    .done(function (data) {
      $("#errorsCount").text(data.count || 0);
    })
    .fail(function () {
      $("#errorsCount").text("N/A");
    });

  // Load activity log
  loadActivityLog();
}

function loadActivityLog() {
  const container = $("#activityLog");
  container.html('<div class="spinner"></div>');

  AdminAPI.getActivity()
    .done(function (data) {
      renderActivityLog(data, container);
    })
    .fail(function () {
      container.html(
        '<div class="alert alert-danger">Failed to load activity log.</div>'
      );
    });
}

function renderActivityLog(data, container) {
  container.empty();

  if (!data || data.length === 0) {
    container.html('<div class="alert alert-info">No recent activity.</div>');
    return;
  }

  data.forEach((activity) => {
    const item = $(`
            <div class="list-group-item">
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>${activity.action}</strong>
                        <small class="text-muted d-block">${
                          activity.user || "Unknown user"
                        }</small>
                    </div>
                    <small class="text-muted">${new Date(
                      activity.timestamp
                    ).toLocaleString()}</small>
                </div>
            </div>
        `);
    container.append(item);
  });
}
