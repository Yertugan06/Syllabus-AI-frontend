// ==========================================
// User API Calls
// ==========================================
const UserAPI = {
  register: function (userData) {
    return $.ajax({
      url: API_BASE + "/api/users/register",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(userData),
    });
  },

  login: function (credentials) {
    return $.ajax({
      url: API_BASE + "/api/users/login",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(credentials),
    });
  },

  updateProfile: function (userId, userData) {
    return $.ajax({
      url: API_BASE + `/api/users/${userId}`,
      type: "PUT",
      headers: getAuthHeaders(),
      contentType: "application/json",
      data: JSON.stringify(userData),
    });
  },
};

// ==========================================
// Syllabus API Calls
// ==========================================
const SyllabusAPI = {
  upload: function (formData, progressCallback) {
    return $.ajax({
      url: API_BASE + "/api/syllabus/upload",
      type: "POST",
      data: formData,
      headers: getAuthHeaders(),
      processData: false,
      contentType: false,
      xhr: function () {
        const xhr = new XMLHttpRequest();
        if (progressCallback) {
          xhr.upload.addEventListener("progress", progressCallback);
        }
        return xhr;
      },
    });
  },

  getTopics: function (syllabusId) {
    return $.ajax({
      url: API_BASE + `/api/syllabus/${syllabusId}/topics`,
      type: "GET",
      headers: getAuthHeaders(),
    });
  },

  updateTopic: function (syllabusId, topicId, data) {
    return $.ajax({
      url: API_BASE + `/api/syllabus/${syllabusId}/topics/${topicId}`,
      type: "PUT",
      headers: getAuthHeaders(),
      contentType: "application/json",
      data: JSON.stringify(data),
    });
  },

  getMaterials: function (syllabusId) {
    return $.ajax({
      url: API_BASE + `/api/syllabus/${syllabusId}/materials`,
      type: "GET",
      headers: getAuthHeaders(),
    });
  },

  getDeadlines: function (syllabusId) {
    return $.ajax({
      url: API_BASE + `/api/syllabus/${syllabusId}/deadlines`,
      type: "GET",
      headers: getAuthHeaders(),
    });
  },

  getSchedule: function (syllabusId) {
    return $.ajax({
      url: API_BASE + `/api/syllabus/${syllabusId}/schedule`,
      type: "GET",
      headers: getAuthHeaders(),
    });
  },
};

// ==========================================
// Admin API Calls
// ==========================================
const AdminAPI = {
  getStats: function (type) {
    return $.ajax({
      url: API_BASE + `/api/admin/stats/${type}`,
      type: "GET",
      headers: getAuthHeaders(),
    });
  },

  getActivity: function () {
    return $.ajax({
      url: API_BASE + "/api/admin/activity",
      type: "GET",
      headers: getAuthHeaders(),
    });
  },
};
