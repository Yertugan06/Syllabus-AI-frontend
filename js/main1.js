// ==========================================
// Global Configuration
// ==========================================
const API_BASE = "http://localhost:8080";

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

    UserAPI.login({ email, password })
      .done(function (response) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.userId);
        localStorage.setItem("isAdmin", response.isAdmin || false);

        showAlert("Login successful!", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      })
      .fail(function (xhr) {
        const error =
          xhr.responseJSON?.message || "Invalid credentials. Please try again.";
        showAlert(error, "error");
      });
  });
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

    UserAPI.register({ name, email, password })
      .done(function (response) {
        showAlert("Registration successful! Please login.", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      })
      .fail(function (xhr) {
        const error =
          xhr.responseJSON?.message || "Registration failed. Please try again.";
        showAlert(error, "error");
      });
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

    UserAPI.updateProfile(userId, { name })
      .done(function () {
        localStorage.setItem("userName", name);
        showAlert("Profile updated successfully!", "success");
      })
      .fail(function () {
        showAlert("Failed to update profile.", "error");
      });
  });
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
    case "profile.html":
      if (requireAuth()) {
        initializeProfile();
        loadProfileData();
      }
      break;
    // Other pages can be added here
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
// Initialize App
// ==========================================
$(document).ready(function () {
  loadComponents();
  initializeFormValidation();
  initializePage();
});
