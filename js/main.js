// ==========================================
// Global Configuration
// ==========================================
const API_BASE = "http://localhost:8080";
const MOCK_MODE = true; // SET TO FALSE WHEN BACKEND IS READY

// ==========================================
// Mock Data and APIs (REMOVE THIS SECTION WHEN BACKEND IS READY)
// ==========================================
const MockAPI = {
  login: function (credentials) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password.length >= 6) {
          resolve({
            token: "mock-jwt-token-" + Date.now(),
            userId: "user-" + Math.random().toString(36).substr(2, 9),
            isAdmin: credentials.email.includes("admin"),
            userName: credentials.email.split("@")[0],
          });
        } else {
          reject({ responseJSON: { message: "Invalid credentials" } });
        }
      }, 1000);
    });
  },

  register: function (userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password && userData.name) {
          resolve({ message: "User registered successfully" });
        } else {
          reject({ responseJSON: { message: "Registration failed" } });
        }
      }, 1000);
    });
  },

  uploadSyllabus: function (formData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ syllabusId: Math.floor(Math.random() * 1000) + 1 });
      }, 2000);
    });
  },
};

const MockData = {
  topics: [
    {
      id: 1,
      title: "Introduction to Programming",
      description: "Basic programming concepts and syntax",
      difficulty: "medium",
    },
    {
      id: 2,
      title: "Data Structures",
      description: "Arrays, linked lists, stacks, and queues",
      difficulty: "hard",
    },
    {
      id: 3,
      title: "Algorithms",
      description: "Sorting and searching algorithms",
      difficulty: "hard",
    },
    {
      id: 4,
      title: "Object-Oriented Programming",
      description: "Classes, objects, and inheritance",
      difficulty: "medium",
    },
  ],
  materials: [
    {
      id: 1,
      title: "Textbook: Introduction to Java",
      description: "Required reading for weeks 1-4",
      type: "Book",
      url: "#",
    },
    {
      id: 2,
      title: "Lecture Slides: Data Structures",
      description: "Weekly lecture presentations",
      type: "Slides",
      url: "#",
    },
    {
      id: 3,
      title: "Programming Exercises",
      description: "Weekly coding assignments",
      type: "Assignment",
      url: "#",
    },
  ],
  deadlines: [
    {
      id: 1,
      title: "Assignment 1: Basic Programs",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      type: "Assignment",
    },
    {
      id: 2,
      title: "Midterm Exam",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      type: "Exam",
    },
    {
      id: 3,
      title: "Final Project Proposal",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      type: "Project",
    },
  ],
  schedule: [
    { id: 1, day: "Monday", time: "10:00 AM - 11:30 AM", location: "Room 101" },
    {
      id: 2,
      day: "Wednesday",
      time: "10:00 AM - 11:30 AM",
      location: "Room 101",
    },
    { id: 3, day: "Friday", time: "2:00 PM - 3:30 PM", location: "Lab 205" },
  ],
};

// ==========================================
// Navigation and Authentication
// ==========================================
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function checkAuth() {
  const token = localStorage.getItem("token");
  if (token) {
    showAuthenticatedNav();
  } else {
    showPublicNav();
  }
}

function showAuthenticatedNav() {
  $("#nav-login, #nav-register").addClass("d-none");
  $("#nav-upload, #nav-dashboard, #nav-profile, #nav-logout").removeClass(
    "d-none"
  );

  // Check if admin
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (isAdmin) {
    $("#nav-admin").removeClass("d-none");
  }
}

function showPublicNav() {
  $("#nav-login, #nav-register").removeClass("d-none");
  $(
    "#nav-upload, #nav-dashboard, #nav-profile, #nav-admin, #nav-logout"
  ).addClass("d-none");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("currentSyllabusId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  window.location.href = "index.html";
}

// ==========================================
// Login Functionality
// ==========================================
function initializeLogin() {
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const form = this;
    if (!form.checkValidity()) {
      e.stopPropagation();
      $(form).addClass("was-validated");
      return;
    }

    const email = $("#login-email").val();
    const password = $("#login-password").val();

    if (MOCK_MODE) {
      // Use mock authentication
      MockAPI.login({ email, password })
        .then(function (response) {
          handleLoginSuccess(response, email);
        })
        .catch(function (error) {
          const errorMsg =
            error.responseJSON?.message ||
            "Invalid credentials. Please try again.";
          showAlert(errorMsg, "error");
        });
    } else {
      // Use real API
      UserAPI.login({ email, password })
        .done(function (response) {
          handleLoginSuccess(response, email);
        })
        .fail(function (xhr) {
          const error =
            xhr.responseJSON?.message ||
            "Invalid credentials. Please try again.";
          showAlert(error, "error");
        });
    }
  });
}

function handleLoginSuccess(response, email) {
  localStorage.setItem("token", response.token);
  localStorage.setItem("userId", response.userId);
  localStorage.setItem("isAdmin", response.isAdmin || false);
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userName", response.userName || email.split("@")[0]);

  showAlert("Login successful!", "success");
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1000);
}

// ==========================================
// Registration Functionality
// ==========================================
function initializeRegistration() {
  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    const form = this;
    if (!form.checkValidity()) {
      e.stopPropagation();
      $(form).addClass("was-validated");
      return;
    }

    const name = $("#reg-name").val();
    const email = $("#reg-email").val();
    const password = $("#reg-password").val();
    const confirm = $("#reg-confirm").val();

    if (password !== confirm) {
      showAlert("Passwords do not match!", "error");
      return;
    }

    if (MOCK_MODE) {
      // Use mock registration
      MockAPI.register({ name, email, password })
        .then(function (response) {
          showAlert("Registration successful! Please login.", "success");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        })
        .catch(function (error) {
          const errorMsg =
            error.responseJSON?.message ||
            "Registration failed. Please try again.";
          showAlert(errorMsg, "error");
        });
    } else {
      // Use real API
      UserAPI.register({ name, email, password })
        .done(function (response) {
          showAlert("Registration successful! Please login.", "success");
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1500);
        })
        .fail(function (xhr) {
          const error =
            xhr.responseJSON?.message ||
            "Registration failed. Please try again.";
          showAlert(error, "error");
        });
    }
  });
}

// ==========================================
// Profile Functionality
// ==========================================
function initializeProfile() {
  $("#profileForm").on("submit", function (e) {
    e.preventDefault();

    const name = $("#profile-name").val();
    const userId = localStorage.getItem("userId");

    if (MOCK_MODE) {
      // Mock profile update
      localStorage.setItem("userName", name);
      showAlert("Profile updated successfully!", "success");
    } else {
      // Use real API
      UserAPI.updateProfile(userId, { name })
        .done(function () {
          localStorage.setItem("userName", name);
          showAlert("Profile updated successfully!", "success");
        })
        .fail(function () {
          showAlert("Failed to update profile.", "error");
        });
    }
  });
}

// ==========================================
// Upload Functionality
// ==========================================
function initializeUpload() {
  $("#uploadForm").on("submit", function (e) {
    e.preventDefault();

    const fileInput = $("#syllabusFile")[0];
    const file = fileInput.files[0];

    if (!file) {
      showAlert("Please select a PDF file.", "error");
      return;
    }

    if (file.type !== "application/pdf") {
      showAlert("Please select a valid PDF file.", "error");
      return;
    }

    const courseName = $("#course-name").val();
    const formData = new FormData();
    formData.append("file", file);
    if (courseName) {
      formData.append("courseName", courseName);
    }

    const $progressBar = $(".progress");
    const $progressFill = $("#uploadProgress");
    $progressBar.show();

    if (MOCK_MODE) {
      // Mock upload with progress simulation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        $progressFill.css("width", progress + "%").text(progress + "%");

        if (progress >= 100) {
          clearInterval(interval);
          MockAPI.uploadSyllabus(formData)
            .then(function (response) {
              localStorage.setItem("currentSyllabusId", response.syllabusId);
              showAlert(
                "Syllabus uploaded and analyzed successfully!",
                "success"
              );
              setTimeout(() => {
                window.location.href = "dashboard.html";
              }, 1500);
            })
            .finally(() => {
              $progressBar.hide();
              $progressFill.css("width", "0%").text("0%");
            });
        }
      }, 200);
    } else {
      // Use real API
      SyllabusAPI.upload(formData, function (e) {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          $progressFill.css("width", percent + "%").text(percent + "%");
        }
      })
        .done(function (response) {
          localStorage.setItem("currentSyllabusId", response.syllabusId);
          showAlert("Syllabus uploaded and analyzed successfully!", "success");
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1500);
        })
        .fail(function (xhr) {
          const error =
            xhr.responseJSON?.message || "Upload failed. Please try again.";
          showAlert(error, "error");
        })
        .always(function () {
          $progressBar.hide();
          $progressFill.css("width", "0%").text("0%");
        });
    }
  });
}

// ==========================================
// Dashboard Data Loading
// ==========================================
function loadDashboardData(type) {
  const syllabusId = localStorage.getItem("currentSyllabusId") || 1;

  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MockData[type] || []);
      }, 800);
    });
  } else {
    // Use real API based on type
    const apiMap = {
      topics: () => SyllabusAPI.getTopics(syllabusId),
      materials: () => SyllabusAPI.getMaterials(syllabusId),
      deadlines: () => SyllabusAPI.getDeadlines(syllabusId),
      schedule: () => SyllabusAPI.getSchedule(syllabusId),
    };

    return apiMap[type]().then((response) => response);
  }
}

// ==========================================
// Component Loading
// ==========================================
function loadComponents() {
  $("#navbar-container").load("components/navbar.html", function () {
    checkAuth();

    // Attach logout handler
    $("#logout-btn").on("click", function (e) {
      e.preventDefault();
      logout();
    });
  });

  $("#footer-container").load("components/footer.html");
}

// ==========================================
// Form Validation
// ==========================================
function initializeFormValidation() {
  $("form.needs-validation").on("submit", function (e) {
    if (!this.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
    }
    $(this).addClass("was-validated");
  });
}

// ==========================================
// Protected Route Check
// ==========================================
function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!requireAuth()) return false;

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!isAdmin) {
    window.location.href = "dashboard.html";
    return false;
  }
  return true;
}

// ==========================================
// Utility Functions
// ==========================================
function showAlert(message, type = "info") {
  const alertClass =
    type === "error"
      ? "alert-danger"
      : type === "success"
      ? "alert-success"
      : "alert-info";

  const alert = $(`
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);

  $("body").prepend(alert);

  setTimeout(() => {
    alert.alert("close");
  }, 5000);
}

// ==========================================
// Page-Specific Initialization
// ==========================================
function initializePage() {
  const currentPage = window.location.pathname.split("/").pop();

  switch (currentPage) {
    case "login.html":
      initializeLogin();
      break;
    case "register.html":
      initializeRegistration();
      break;
    case "upload.html":
      if (requireAuth()) {
        initializeUpload();
      }
      break;
    case "profile.html":
      if (requireAuth()) {
        initializeProfile();
        loadProfileData();
      }
      break;
    case "admin.html":
      if (requireAdmin()) {
        // Admin specific initialization
      }
      break;
  }
}

function loadProfileData() {
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const userName = localStorage.getItem("userName") || "";

  $("#profile-email").val(userEmail);
  $("#profile-name").val(userName);
  $("#member-since").val(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  );
}

// ==========================================
// Demo Account Setup
// ==========================================
function setupDemoAccount() {
  // Check if this is first visit
  const hasVisited = localStorage.getItem("hasVisited");
  const isLoggedIn = localStorage.getItem("token");

  if (!hasVisited) {
    // Initialize demo accounts in MockAPI
    initializeDemoAccounts();
    localStorage.setItem("hasVisited", "true");

    console.log("Demo accounts initialized!");
    console.log("Student: demo@student.edu / demo123");
    console.log("Admin: admin@edu.edu / admin123");
  }

  // Auto-fill login form for convenience (but don't auto-login)
  autoFillLoginForm();
}

function initializeDemoAccounts() {
  // Clear any existing demo accounts to avoid duplicates
  MockAPI.users = MockAPI.users.filter(
    (user) =>
      !user.email.includes("demo") && !user.email.includes("admin@edu.edu")
  );

  // Add demo student account
  MockAPI.users.push({
    email: "demo@student.edu",
    password: "demo123",
    name: "Demo Student",
    isAdmin: false, // Changed from true to false
  });

  // Add demo admin account
  MockAPI.users.push({
    email: "admin@edu.edu",
    password: "admin123",
    name: "Demo Admin",
    isAdmin: true,
  });
}

function autoFillLoginForm() {
  // Only auto-fill if on login page and no one is logged in
  if (
    window.location.pathname.includes("login.html") &&
    !localStorage.getItem("token")
  ) {
    setTimeout(() => {
      $("#login-email").val("demo@student.edu");
      $("#login-password").val("demo123");
      showAlert(
        "Demo credentials auto-filled! Feel free to change them or click Login.",
        "info"
      );
    }, 1000);
  }
}
// ==========================================
// Initialize App
// ==========================================
$(document).ready(function () {
  setupDemoAccount();
  loadComponents();
  initializeFormValidation();
  initializePage();
});
