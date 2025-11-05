// ==========================================
// Admin Panel Functionality with Mock Support
// ==========================================
$(document).ready(function () {
  if (!requireAdmin()) return;

  loadAdminStats();
});

function loadAdminStats() {
  if (MOCK_MODE) {
    // Use mock data for admin stats
    setTimeout(() => {
      $("#uploadCount").text("42");
      $("#usersCount").text("156");
      $("#errorsCount").text("3");
      loadActivityLog();
    }, 800);
  } else {
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
}

function loadActivityLog() {
  const container = $("#activityLog");
  container.html('<div class="spinner"></div>');

  if (MOCK_MODE) {
    // Use mock activity data
    const mockActivity = [
      {
        action: "User Registration",
        user: "newuser@student.edu",
        timestamp: new Date(Date.now() - 300000),
      },
      {
        action: "Syllabus Upload",
        user: "demo@student.edu",
        timestamp: new Date(Date.now() - 600000),
      },
      {
        action: "System Login",
        user: "admin@edu.edu",
        timestamp: new Date(Date.now() - 900000),
      },
      {
        action: "Profile Update",
        user: "john@student.edu",
        timestamp: new Date(Date.now() - 1200000),
      },
      {
        action: "Syllabus Analysis",
        user: "demo@student.edu",
        timestamp: new Date(Date.now() - 1500000),
      },
    ];

    setTimeout(() => {
      renderActivityLog(mockActivity, container);
    }, 800);
  } else {
    // Use real API
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
