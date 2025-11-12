function loadComponent(containerId, componentPath) {
  return new Promise((resolve, reject) => {
    $.get(componentPath)
      .done(function (data) {
        $("#" + containerId).html(data);
        resolve(data);
      })
      .fail(function (error) {
        console.error("Failed to load component:", componentPath, error);

        // Create fallback content based on component type
        let fallbackContent = "";

        if (componentPath.includes("navbar")) {
          fallbackContent = `
                        <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
        <a class="navbar-brand" href="index.html">
            <i class="fas fa-graduation-cap me-2"></i>
            <span class="fw-bold">Syllabus AI</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            
            <ul class="navbar-nav ms-auto">
                <!-- Theme Toggle -->
                <li class="nav-item">
                    <a class="nav-link theme-toggle" id="themeToggle" title="Toggle Dark Mode">
                        <i class="fas fa-moon"></i>
                    </a>
                </li>
                
                <!-- Login/Register Links (shown when not logged in) -->
                <li class="nav-item" id="navLogin">
                    <a class="nav-link" href="login.html">
                        <i class="fas fa-sign-in-alt me-1"></i>Login
                    </a>
                </li>
                <li class="nav-item" id="navRegister">
                    <a class="nav-link" href="register.html">
                        <i class="fas fa-user-plus me-1"></i>Register
                    </a>
                </li>
                
                <!-- User Menu (shown when logged in) -->
                <li class="nav-item dropdown" id="navUserMenu" style="display: none;">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-1"></i>
                        <span id="userDisplayName"></span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li class="dropdown-header text-muted small" id="userEmail"></li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item" href="upload.html">
                                <i class="fas fa-upload me-2"></i>Upload Syllabus
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="dashboard.html">
                                <i class="fas fa-tachometer-alt me-2"></i>Dashboard
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="profile.html">
                                <i class="fas fa-user me-2"></i>Profile
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item text-danger" href="#" id="navLogout">
                                <i class="fas fa-sign-out-alt me-2"></i>Logout
                            </a>
                        </li>
                    </ul>
                </li>
                
                <!-- Admin Link (shown only to admins) -->
                <li class="nav-item" id="navAdmin" style="display: none;">
                    <a class="nav-link text-warning" href="admin.html">
                        <i class="fas fa-cog me-1"></i>Admin
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>
                    `;
        } else if (componentPath.includes("footer")) {
          fallbackContent = `
                        <footer class="bg-dark text-light py-5 mt-5">
    <div class="container">
        <div class="row">
            <div class="col-md-6 mb-3">
                <h5><i class="fas fa-graduation-cap"></i> Syllabus AI</h5>
                <p class="footer-text">Transform your course syllabi into smart, actionable study plans with AI-powered analysis.</p>
                <div class="social-links">
                    <a href="#" class="text-light me-3"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="text-light me-3"><i class="fab fa-linkedin"></i></a>
                    <a href="#" class="text-light"><i class="fab fa-github"></i></a>
                </div>
            </div>
            <div class="col-md-2">
                <h6>Product</h6>
                <ul class="list-unstyled">
                    <li><a href="index.html" class="footer-link text-decoration-none">Home</a></li>
                    <li><a href="upload.html" class="footer-link text-decoration-none">Upload</a></li>
                    <li><a href="dashboard.html" class="footer-link text-decoration-none">Dashboard</a></li>
                    <li><a href="about.html" class="footer-link text-decoration-none"> About us </a><li>
                </ul>
            </div>
            <div class="col-md-2">
                <h6>Resources</h6>
                <ul class="list-unstyled">
                    <li><a href="#" class="footer-link text-decoration-none">Documentation</a></li>
                    <li><a href="#" class="footer-link text-decoration-none">API</a></li>
                    <li><a href="#" class="footer-link text-decoration-none">Help Center</a></li>
                    <li><a href="#" class="footer-link text-decoration-none">Blog</a></li>
                </ul>
            </div>
            <div class="col-md-2">
                <h6>Company</h6>
                <ul class="list-unstyled">
                    <li><a href="#" class="footer-link text-decoration-none">Careers</a></li>
                    <li><a href="#" class="footer-link text-decoration-none">Contact</a></li>
                    <li><a href="#" class="footer-link text-decoration-none">Privacy</a></li>
                </ul>
            </div>
        </div>

        <div class="row align-items-center">
            <div class="col-md-6">
                <p class="footer-text mb-0">&copy; 2025 Syllabus AI. All rights reserved.</p>
            </div>
        </div>
    </div>
</footer>
                    `;
        }

        $("#" + containerId).html(fallbackContent);
        resolve(fallbackContent);
      });
  });
}

// AUTH MANAGER
const AuthManager = {
  isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch {
      return {};
    }
  },

  async login(email, password) {
    try {
      const result = await api.login(email, password);
      
      if (result.token) {
        localStorage.setItem("token", result.token);
        
        // Store user data if available
        if (result.user) {
          localStorage.setItem("currentUser", JSON.stringify(result.user));
        } else {
          // Fallback: create minimal user object
          localStorage.setItem("currentUser", JSON.stringify({
            email: email,
            firstName: email.split('@')[0]
          }));
        }
        
        console.log("Login successful");
        return { success: true, user: result.user || { email: email } };
      } else {
        return { success: false, error: "No token received" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.message || "Invalid credentials or server error" 
      };
    }
  },

  async register(userData) {
    try {
      const result = await api.register(userData);
      
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("currentUser", JSON.stringify(result.user || userData));
        return { success: true, user: result.user || userData };
      } else {
        return { success: false, error: "Registration failed" };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || "Registration failed" 
      };
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  },

  // Simple admin check by email (for demo)
  isAdmin() {
    const user = this.getCurrentUser();
    return user.email === "admin@syllabusai.com";
  }
};

// Update navigation
function updateNavigation() {
  const isLoggedIn = AuthManager.isAuthenticated();
  
  if (isLoggedIn) {
    $('#navLogin, #navRegister').hide();
    $('#navUserMenu').show();
    
    const user = AuthManager.getCurrentUser();
    $('#userDisplayName').text(user.firstName || user.email || 'User');
    $('#userEmail').text(user.email || '');
    
    // Show admin link for admin users
    if (AuthManager.isAdmin()) {
      $('#navAdmin').show();
    } else {
      $('#navAdmin').hide();
    }
  } else {
    $('#navLogin, #navRegister').show();
    $('#navUserMenu, #navAdmin').hide();
  }
}

// Auth requirement check
function requireAuth(requiredRole = null) {
  if (!AuthManager.isAuthenticated()) {
    showModal(
      "Authentication Required",
      "Please log in to access this page.",
      "Login",
      () => {
        window.location.href = "login.html";
      }
    );
    return false;
  }

  if (requiredRole && !AuthManager.hasRole(requiredRole)) {
    showModal(
      "Access Denied",
      "You do not have permission to access this page.",
      "OK",
      () => {
        window.location.href = "dashboard.html";
      }
    );
    return false;
  }

  return true;
}

// Simple modal function
function showModal(title, content, actionText = "OK", onAction = null) {
  $("#modalTitle").text(title);
  $("#modalContent").html(content);
  $("#modalAction").text(actionText);

  $("#modalAction")
    .off("click")
    .click(function () {
      if (onAction) onAction();
      $("#customModal").removeClass("active");
    });

  $("#modalClose")
    .off("click")
    .click(function () {
      $("#customModal").removeClass("active");
    });

  $("#customModal").addClass("active");
}

// Enhanced theme initialization
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  const isDark = savedTheme === "dark";

  if (isDark) {
    $("body").addClass("dark-mode");
    $(".theme-toggle i").removeClass("fa-moon").addClass("fa-sun");
  } else {
    $("body").removeClass("dark-mode");
    $(".theme-toggle i").removeClass("fa-sun").addClass("fa-moon");
  }
}

// Enhanced Carousel with Better Touch Support
class Carousel {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 0;
    this.autoAdvanceInterval = null;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.dragThreshold = 50;
    this.initializeCarousel();
  }

  initializeCarousel() {
    $(document).ready(() => {
      this.setupCarousel();
      this.bindEvents();
      this.bindTouchEvents();
      this.startAutoAdvance();
    });
  }

  setupCarousel() {
    const $slides = $(".carousel-slide");
    this.totalSlides = $slides.length;

    console.log("Carousel setup:", this.totalSlides, "slides found");

    if (this.totalSlides === 0) {
      console.warn("No carousel slides found");
      return;
    }

    this.createIndicators();
    this.updateCarousel();
  }

  createIndicators() {
    const $indicators = $("#carouselIndicators");
    $indicators.empty();

    for (let i = 0; i < this.totalSlides; i++) {
      $indicators.append(
        `<div class="carousel-indicator ${
          i === 0 ? "active" : ""
        }" data-slide="${i}"></div>`
      );
    }
  }

  bindEvents() {
    // Next button
    $("#carouselNext")
      .off("click")
      .click((e) => {
        e.preventDefault();
        e.stopPropagation();
        this.nextSlide();
      });

    // Previous button
    $("#carouselPrev")
      .off("click")
      .click((e) => {
        e.preventDefault();
        e.stopPropagation();
        this.prevSlide();
      });

    // Indicator clicks
    $(document)
      .off("click", ".carousel-indicator")
      .on("click", ".carousel-indicator", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slideIndex = parseInt($(e.target).data("slide"));
        this.goToSlide(slideIndex);
      });

    // Pause on hover (desktop only)
    if (!this.isTouchDevice()) {
      $(".custom-carousel").hover(
        () => this.stopAutoAdvance(),
        () => this.startAutoAdvance()
      );
    }

    // Handle window resize
    $(window).on("resize", () => {
      this.updateCarousel();
    });
  }

  bindTouchEvents() {
    const $carousel = $(".custom-carousel");
    const $slidesContainer = $("#carouselSlides");

    // Touch events
    $slidesContainer.on("touchstart", (e) => {
      this.handleTouchStart(e.originalEvent);
    });

    $slidesContainer.on("touchmove", (e) => {
      this.handleTouchMove(e.originalEvent);
    });

    $slidesContainer.on("touchend", (e) => {
      this.handleTouchEnd(e.originalEvent);
    });

    // Mouse events for desktop testing
    $slidesContainer.on("mousedown", (e) => {
      this.handleMouseDown(e);
    });

    $(document).on("mousemove", (e) => {
      if (this.isDragging) {
        this.handleMouseMove(e);
      }
    });

    $(document).on("mouseup", (e) => {
      if (this.isDragging) {
        this.handleMouseUp(e);
      }
    });
  }

  handleTouchStart(e) {
    this.stopAutoAdvance();
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.currentX = this.startX;

    $("#carouselSlides").css("transition", "none");
    $(".custom-carousel").css("cursor", "grabbing");
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.touches[0].clientX;
    const diff = this.currentX - this.startX;

    const translateX =
      -this.currentSlide * 100 + (diff / this.getCarouselWidth()) * 100;
    $("#carouselSlides").css("transform", `translateX(${translateX}%)`);
  }

  handleTouchEnd(e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    $(".custom-carousel").css("cursor", "");
    $("#carouselSlides").css(
      "transition",
      "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    );

    const diff = this.currentX - this.startX;
    const slideWidth = this.getCarouselWidth();
    const threshold = slideWidth * 0.15;

    if (Math.abs(diff) > this.dragThreshold && Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    } else {
      this.updateCarousel();
    }

    this.startAutoAdvance();
  }

  handleMouseDown(e) {
    this.stopAutoAdvance();
    this.isDragging = true;
    this.startX = e.clientX;
    this.currentX = this.startX;

    $("#carouselSlides").css("transition", "none");
    $(".custom-carousel").css("cursor", "grabbing");
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.clientX;
    const diff = this.currentX - this.startX;
    const translateX =
      -this.currentSlide * 100 + (diff / this.getCarouselWidth()) * 100;
    $("#carouselSlides").css("transform", `translateX(${translateX}%)`);
  }

  handleMouseUp(e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    $(".custom-carousel").css("cursor", "");
    $("#carouselSlides").css(
      "transition",
      "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    );

    const diff = this.currentX - this.startX;
    const slideWidth = this.getCarouselWidth();
    const threshold = slideWidth * 0.15;

    if (Math.abs(diff) > this.dragThreshold && Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    } else {
      this.updateCarousel();
    }

    this.startAutoAdvance();
  }

  getCarouselWidth() {
    return $(".custom-carousel").width() || window.innerWidth;
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateCarousel();
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateCarousel();
  }

  goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < this.totalSlides) {
      this.currentSlide = slideIndex;
      this.updateCarousel();
    }
  }

  updateCarousel() {
    const translateX = -this.currentSlide * 100;
    $("#carouselSlides").css("transform", `translateX(${translateX}%)`);

    // Update indicators
    $(".carousel-indicator").removeClass("active");
    $(`.carousel-indicator[data-slide="${this.currentSlide}"]`).addClass(
      "active"
    );

    // Add slide change animation class
    $("#carouselSlides").addClass("sliding");
    setTimeout(() => {
      $("#carouselSlides").removeClass("sliding");
    }, 400);
  }

  startAutoAdvance() {
    this.stopAutoAdvance();

    // Don't auto-advance on touch devices or if only one slide
    if (this.isTouchDevice() || this.totalSlides <= 1) return;

    this.autoAdvanceInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoAdvance() {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
  }

  isTouchDevice() {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }
}

// Dashboard initialization
function initializeDashboard() {
  if (typeof Dashboard !== "undefined" && $("#topicsContainer").length) {
    window.dashboard = new Dashboard();
    window.dashboard.loadDashboard();
  }
}

// Initialize everything
$(document).ready(function () {
  // Check authentication for protected pages
  const protectedPages = ['dashboard.html', 'upload.html', 'profile.html'];
  const currentPage = window.location.pathname.split('/').pop();

  if (protectedPages.includes(currentPage) && !AuthManager.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  console.log("Initializing application...");

  initializeTheme();

  // Load navbar if container exists
  if ($("#navbar-container").length) {
    loadComponent("navbar-container", "components/navbar.html")
      .then(() => {
        console.log("Navbar loaded successfully");
        updateNavigation();

        // Theme toggle
        $(document).on("click", "#themeToggle", function () {
          $("body").toggleClass("dark-mode");
          const isDark = $("body").hasClass("dark-mode");
          localStorage.setItem("theme", isDark ? "dark" : "light");

          const $icon = $(this).find("i");
          if (isDark) {
            $icon.removeClass("fa-moon").addClass("fa-sun");
          } else {
            $icon.removeClass("fa-sun").addClass("fa-moon");
          }
        });

        // Logout
        $(document).on("click", "#navLogout", function (e) {
          e.preventDefault();
          AuthManager.logout();
        });
      })
      .catch((error) => {
        console.error("Failed to load navbar:", error);
      });
  }

  // Load footer if container exists
  if ($("#footer-container").length) {
    loadComponent("footer-container", "components/footer.html")
      .then(() => {
        console.log("Footer loaded successfully");
      })
      .catch((error) => {
        console.error("Failed to load footer:", error);
      });
  }

  // Modal close handlers
  $(document).on("click", "#modalClose", function () {
    $("#customModal").removeClass("active");
  });

  $(document).on("click", "#customModal", function (e) {
    if (e.target === this) {
      $("#customModal").removeClass("active");
    }
  });

  // Home page specific initialization
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    $("#learnMoreBtn").click(function () {
      showModal(
        "About Syllabus AI",
        "Syllabus AI helps students and educators organize course materials efficiently using artificial intelligence. Upload your syllabus and let our system extract topics, deadlines, and materials automatically!"
      );
    });

    // Initialize carousel
    if ($(".custom-carousel").length) {
      console.log("Initializing enhanced carousel...");
      window.carousel = new Carousel();
    }

    // Features click handlers
    $(".feature-card").click(function () {
      const title = $(this).find(".card-title").text();
      const description = $(this).find(".card-text").text();
      showModal(title, description);
    });
  }

  // Initialize dashboard if on dashboard page
  initializeDashboard();
});