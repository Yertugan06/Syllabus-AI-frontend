// ==========================================
// Dashboard Page Functionality
// ==========================================
$(document).ready(function () {
  if (!requireAuth()) return;

  // Initialize tab functionality
  initializeTabs();

  // Load initial data
  loadTopics();
});

function initializeTabs() {
  // Topics tab
  $("#topics-tab").on("click", function () {
    loadTopics();
  });

  // Materials tab
  $("#materials-tab").on("click", function () {
    loadMaterials();
  });

  // Schedule tab
  $("#schedule-tab").on("click", function () {
    loadSchedule();
  });

  // Deadlines tab
  $("#deadlines-tab").on("click", function () {
    loadDeadlines();
  });
}

function loadTopics() {
  const syllabusId = localStorage.getItem("currentSyllabusId") || 1;
  const container = $("#topicsContainer");

  container.html('<div class="spinner"></div>');

  SyllabusAPI.getTopics(syllabusId)
    .done(function (data) {
      renderTopics(data, container);
    })
    .fail(function () {
      container.html(
        '<div class="alert alert-danger">Failed to load topics. Please try again.</div>'
      );
    });
}

function renderTopics(data, container) {
  container.empty();

  if (!data || data.length === 0) {
    container.html(
      '<div class="alert alert-info">No topics found. Upload a syllabus to get started!</div>'
    );
    return;
  }

  data.forEach((topic) => {
    const item = $(`
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${topic.title || topic.name}</h6>
                    <small class="text-muted">${
                      topic.description || "No description"
                    }</small>
                </div>
                <select class="form-select difficulty-tag" data-id="${
                  topic.id
                }" style="width: 150px;">
                    <option value="easy" ${
                      topic.difficulty === "easy" ? "selected" : ""
                    }>Easy</option>
                    <option value="medium" ${
                      topic.difficulty === "medium" ? "selected" : ""
                    }>Medium</option>
                    <option value="hard" ${
                      topic.difficulty === "hard" ? "selected" : ""
                    }>Hard</option>
                </select>
            </div>
        `);
    container.append(item);
  });

  // Handle difficulty change
  $(".difficulty-tag").on("change", function () {
    const topicId = $(this).data("id");
    const difficulty = $(this).val();
    updateTopicDifficulty(topicId, difficulty);
  });
}

function updateTopicDifficulty(topicId, difficulty) {
  const syllabusId = localStorage.getItem("currentSyllabusId") || 1;

  SyllabusAPI.updateTopic(syllabusId, topicId, { difficulty })
    .done(function () {
      console.log("Difficulty updated successfully");
    })
    .fail(function () {
      showAlert("Failed to update difficulty", "error");
    });
}

function loadMaterials() {
  const syllabusId = localStorage.getItem("currentSyllabusId") || 1;
  const container = $("#materialsContainer");

  container.html('<div class="spinner"></div>');

  SyllabusAPI.getMaterials(syllabusId)
    .done(function (data) {
      renderMaterials(data, container);
    })
    .fail(function () {
      container.html(
        '<div class="alert alert-danger">Failed to load materials.</div>'
      );
    });
}

function renderMaterials(data, container) {
  container.empty();

  if (!data || data.length === 0) {
    container.html('<div class="alert alert-info">No materials found.</div>');
    return;
  }

  data.forEach((material) => {
    const item = $(`
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">
                            <i class="bi bi-book"></i> ${
                              material.title || material.name
                            }
                        </h6>
                        <p class="mb-1 text-muted">${
                          material.description || ""
                        }</p>
                        ${
                          material.type
                            ? `<span class="badge bg-primary">${material.type}</span>`
                            : ""
                        }
                    </div>
                    ${
                      material.url
                        ? `<a href="${material.url}" target="_blank" class="btn btn-sm btn-outline-primary">View</a>`
                        : ""
                    }
                </div>
            </div>
        `);
    container.append(item);
  });
}

function loadDeadlines() {
  const syllabusId = localStorage.getItem("currentSyllabusId") || 1;
  const container = $("#deadlinesContainer");

  container.html('<div class="spinner"></div>');

  SyllabusAPI.getDeadlines(syllabusId)
    .done(function (data) {
      renderDeadlines(data, container);
    })
    .fail(function () {
      container.html(
        '<div class="alert alert-danger">Failed to load deadlines.</div>'
      );
    });
}

function renderDeadlines(data, container) {
  container.empty();

  if (!data || data.length === 0) {
    container.html('<div class="alert alert-info">No deadlines found.</div>');
    return;
  }

  data.forEach((deadline) => {
    const date = new Date(deadline.date);
    const isPast = date < new Date();
    const item = $(`
            <div class="list-group-item ${isPast ? "bg-light" : ""}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">
                            <i class="bi bi-alarm"></i> ${
                              deadline.title || deadline.name
                            }
                        </h6>
                        <small class="text-muted">${
                          deadline.description || ""
                        }</small>
                    </div>
                    <div class="text-end">
                        <span class="badge ${
                          isPast ? "bg-secondary" : "bg-danger"
                        }">
                            ${date.toLocaleDateString()}
                        </span>
                        ${
                          deadline.type
                            ? `<br><small class="text-muted">${deadline.type}</small>`
                            : ""
                        }
                    </div>
                </div>
            </div>
        `);
    container.append(item);
  });
}

function loadSchedule() {
  const syllabusId = localStorage.getItem("currentSyllabusId") || 1;
  const container = $("#scheduleContainer");

  container.html('<div class="spinner"></div>');

  SyllabusAPI.getSchedule(syllabusId)
    .done(function (data) {
      renderSchedule(data, container);
    })
    .fail(function () {
      container.html(
        '<div class="alert alert-danger">Failed to load schedule.</div>'
      );
    });
}

function renderSchedule(data, container) {
  container.empty();

  if (!data || data.length === 0) {
    container.html(
      '<div class="alert alert-info">No schedule information found.</div>'
    );
    return;
  }

  data.forEach((schedule) => {
    const item = $(`
            <div class="list-group-item">
                <div class="d-flex justify-content-between">
                    <div>
                        <h6 class="mb-1">${schedule.day || "TBD"}</h6>
                        <p class="mb-0 text-muted">${schedule.time || ""}</p>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-info">${
                          schedule.location || "Online"
                        }</span>
                    </div>
                </div>
            </div>
        `);
    container.append(item);
  });
}
