class Dashboard {
  constructor() {
    this.currentFilter = "all";
    this.searchQuery = "";
    this.userSyllabi = [];
    this.currentSyllabus = null;
    this.completedTopics = new Set();
  }

  async loadDashboard() {
    console.log("=== DASHBOARD LOAD START ===");
    
    if (!AuthManager.isAuthenticated()) {
      console.warn("User not authenticated");
      showModal(
        "Authentication Required",
        "Please log in to view your dashboard.",
        "Login",
        () => {
          window.location.href = "login.html";
        }
      );
      return;
    }

    console.log("User authenticated, loading data...");

    try {
      this.showLoadingState();

      // Get user's syllabi from backend
      console.log("Fetching user syllabi...");
      this.userSyllabi = await api.getUserSyllabi();
      console.log("Syllabi received:", this.userSyllabi);
      
      if (this.userSyllabi.length > 0) {
        this.currentSyllabus = this.userSyllabi[0];
        console.log("Using syllabus:", this.currentSyllabus);
        await this.loadSyllabusData(this.currentSyllabus.id);
      } else {
        console.log("No syllabi found, showing empty state");
        this.renderEmptyState();
      }

      this.initializeDashboardEvents();
      this.updateProgressCounts();
      
    } catch (error) {
      console.error("Error loading dashboard:", error);
      console.error("Error details:", error.message, error.stack);
      
      // Show error to user
      showModal(
        "Error Loading Dashboard",
        `Failed to load your data: ${error.message}. Using demo data instead.`,
        "OK"
      );
      
      // Use mock data for demo
      this.renderMockData();
      this.initializeDashboardEvents();
      this.updateProgressCounts();
    }
  }

  async loadSyllabusData(syllabusId) {
    console.log("=== LOADING SYLLABUS DATA ===");
    console.log("Syllabus ID:", syllabusId);
    
    try {
      console.log("Fetching topics, materials, and deadlines...");
      
      const [topics, materials, deadlines] = await Promise.all([
        api.getSyllabusTopics(syllabusId).then(data => {
          console.log("Topics received:", data);
          return data;
        }),
        api.getSyllabusMaterials(syllabusId).then(data => {
          console.log("Materials received:", data);
          return data;
        }),
        api.getSyllabusDeadlines(syllabusId).then(data => {
          console.log("Deadlines received:", data);
          return data;
        })
      ]);

      const syllabusData = {
        course: {
          title: this.currentSyllabus.fileName || "Your Course",
          code: "Extracted from PDF",
          instructor: "Your Instructor"
        },
        topics: topics || [],
        materials: materials || [],
        deadlines: deadlines || []
      };

      console.log("Rendering dashboard with data:", syllabusData);
      this.renderDashboardData(syllabusData);
      
    } catch (error) {
      console.error("Error loading syllabus data:", error);
      console.error("Error details:", error.message, error.stack);
      throw error;
    }
  }

  renderMockData() {
    console.log("Rendering mock data");
    const mockData = api.getMockSyllabusData();
    this.renderDashboardData({
      course: {
        title: mockData.fileName,
        code: "Sample Course",
        instructor: "Professor Name"
      },
      topics: mockData.analysis.extractedData.topics,
      materials: mockData.analysis.extractedData.materials,
      deadlines: mockData.analysis.extractedData.deadlines
    });
  }

  showLoadingState() {
    console.log("Showing loading state");
    const loadingHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2">Loading your study plan...</p>
      </div>
    `;
    $("#topicsContainer, #materialsContainer, #deadlinesContainer").html(loadingHTML);
  }

  renderDashboardData(data) {
    console.log("=== RENDERING DASHBOARD DATA ===");
    console.log("Topics count:", data.topics.length);
    console.log("Materials count:", data.materials.length);
    console.log("Deadlines count:", data.deadlines.length);
    
    this.renderTopics(data.topics);
    this.renderMaterials(data.materials);
    this.renderDeadlines(data.deadlines);

    // Update course info
    $(".course-title").text(data.course.title);
    $(".course-code").text(data.course.code);
    $(".course-instructor").text(data.course.instructor);
    
    console.log("Dashboard rendered successfully");
  }

  renderEmptyState() {
    console.log("Rendering empty state");
    const emptyStateHTML = `
      <div class="text-center py-5">
        <i class="fas fa-file-upload fa-4x text-muted mb-3"></i>
        <h4 class="text-muted">No Syllabus Uploaded Yet</h4>
        <p class="text-muted mb-4">Upload your first syllabus to see your study plan here.</p>
        <a href="upload.html" class="btn btn-primary">
          <i class="fas fa-upload me-2"></i>Upload Your First Syllabus
        </a>
      </div>
    `;

    $("#topicsContainer, #materialsContainer, #deadlinesContainer").html(emptyStateHTML);
  }

  renderTopics(topics = []) {
    console.log("Rendering topics:", topics.length);
    const container = $("#topicsContainer");
    container.empty();

    if (topics.length === 0) {
      console.log("No topics to render");
      container.html('<p class="text-center text-muted">No topics found.</p>');
      return;
    }

    const filtered = this.filterData(topics);
    console.log("Filtered topics:", filtered.length);
    
    filtered.forEach((topic, index) => {
      console.log(`Rendering topic ${index + 1}:`, topic);
      const isCompleted = this.completedTopics.has(topic.id);
      
      container.append(`
        <div class="list-group-item" data-difficulty="${(topic.difficultyLevel || 'medium').toLowerCase()}">
          <div class="d-flex justify-content-between align-items-center">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center mb-2">
                <button class="btn btn-sm ${isCompleted ? 'btn-success' : 'btn-outline-secondary'} me-3 topic-complete-btn" 
                        data-topic-id="${topic.id}">
                  <i class="fas ${isCompleted ? 'fa-check' : 'fa-circle'}"></i>
                </button>
                <div>
                  <h6 class="mb-1">${topic.title}</h6>
                  <p class="mb-1 text-muted small">${topic.description || 'No description'}</p>
                  ${topic.week ? `<small class="text-muted">Week ${topic.week}</small>` : ''}
                </div>
              </div>
            </div>
            <span class="badge difficulty-badge difficulty-${(topic.difficultyLevel || 'medium').toLowerCase()}">
              ${topic.difficultyLevel || 'MEDIUM'}
            </span>
          </div>
        </div>
      `);
    });

    console.log("Topics rendered successfully");

    // Bind completion events
    $(".topic-complete-btn").click((e) => {
      const topicId = $(e.currentTarget).data("topic-id");
      this.toggleTopicCompletion(topicId);
    });
  }

  renderMaterials(materials = []) {
    console.log("Rendering materials:", materials.length);
    const container = $("#materialsContainer");
    container.empty();

    if (materials.length === 0) {
      console.log("No materials to render");
      container.html('<p class="text-center text-muted">No materials found.</p>');
      return;
    }

    materials.forEach((material, index) => {
      console.log(`Rendering material ${index + 1}:`, material);
      const iconClass = this.getMaterialIcon(material.type);
      
      container.append(`
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i class="fas ${iconClass} me-3"></i>
              <div>
                <h6 class="mb-0">${material.title}</h6>
                <small class="text-muted">${material.type || 'Material'}</small>
              </div>
            </div>
            ${material.url && material.url !== '' ? `
              <a href="${material.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-external-link-alt"></i>
              </a>
            ` : ''}
          </div>
        </div>
      `);
    });

    console.log("Materials rendered successfully");
  }

  getMaterialIcon(type) {
    const icons = {
      'TEXTBOOK': 'fa-book text-primary',
      'READING': 'fa-book-open text-primary',
      'VIDEO': 'fa-video text-danger',
      'EXERCISE': 'fa-dumbbell text-success',
      'WEBSITE': 'fa-globe text-info',
      'SLIDES': 'fa-images text-warning'
    };
    return icons[type] || 'fa-file text-secondary';
  }

  renderDeadlines(deadlines = []) {
    console.log("Rendering deadlines:", deadlines.length);
    const container = $("#deadlinesContainer");
    container.empty();

    if (deadlines.length === 0) {
      console.log("No deadlines to render");
      container.html('<p class="text-center text-muted">No deadlines found.</p>');
      return;
    }

    deadlines.forEach((deadline, index) => {
      console.log(`Rendering deadline ${index + 1}:`, deadline);
      const daysUntil = this.getDaysUntil(deadline.dueDate);
      const urgency = this.getUrgencyClass(daysUntil);
      
      container.append(`
        <div class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">${deadline.title}</h6>
              <small class="text-muted">
                Due: ${new Date(deadline.dueDate).toLocaleDateString()} 
                (${daysUntil} days)
              </small>
              ${deadline.description ? `<p class="mb-0 mt-1 small">${deadline.description}</p>` : ''}
            </div>
            <span class="badge bg-${urgency}">${deadline.type}</span>
          </div>
        </div>
      `);
    });

    console.log("Deadlines rendered successfully");
  }

  getDaysUntil(dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getUrgencyClass(days) {
    if (days < 0) return 'secondary';
    if (days < 3) return 'danger';
    if (days < 7) return 'warning';
    return 'success';
  }

  filterData(items) {
    return items.filter(item => {
      const matchesFilter = this.currentFilter === 'all' || 
        (item.difficultyLevel && item.difficultyLevel.toLowerCase() === this.currentFilter);
      const matchesSearch = !this.searchQuery || 
        (item.title && item.title.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }

  toggleTopicCompletion(topicId) {
    console.log("Toggling completion for topic:", topicId);
    if (this.completedTopics.has(topicId)) {
      this.completedTopics.delete(topicId);
    } else {
      this.completedTopics.add(topicId);
    }
    
    // Re-render topics with current syllabus data
    if (this.currentSyllabus) {
      this.loadSyllabusData(this.currentSyllabus.id);
    }
    this.updateProgressCounts();
  }

  updateProgressCounts() {
    console.log("Updating progress counts");
    
    // Get counts from current loaded data
    const topicsCount = $("#topicsContainer .list-group-item").length;
    const materialsCount = $("#materialsContainer .list-group-item").length;
    const deadlinesCount = $("#deadlinesContainer .list-group-item").length;

    console.log("Counts - Topics:", topicsCount, "Materials:", materialsCount, "Deadlines:", deadlinesCount);

    $("#totalTopicsCount").text(topicsCount);
    $("#totalMaterials").text(materialsCount);
    $("#completedTopics").text(this.completedTopics.size);
    
    // Count upcoming deadlines (next 30 days)
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    let upcomingCount = 0;
    
    $("#deadlinesContainer .list-group-item").each(function() {
      const text = $(this).text();
      const match = text.match(/Due: (\d+\/\d+\/\d+)/);
      if (match) {
        const due = new Date(match[1]);
        if (due > now && due <= thirtyDays) {
          upcomingCount++;
        }
      }
    });
    
    $("#upcomingDeadlines").text(upcomingCount);
    console.log("Progress counts updated");
  }

  initializeDashboardEvents() {
    console.log("Initializing dashboard events");
    
    // Search
    $("#dashboardSearch").off("input").on("input", (e) => {
      this.searchQuery = e.target.value;
      console.log("Search query:", this.searchQuery);
      if (this.currentSyllabus) {
        this.loadSyllabusData(this.currentSyllabus.id);
      }
    });

    // Filters
    $(".filter-btn").off("click").on("click", (e) => {
      $(".filter-btn").removeClass("active");
      $(e.target).addClass("active");
      this.currentFilter = $(e.target).data("filter");
      console.log("Filter changed:", this.currentFilter);
      if (this.currentSyllabus) {
        this.loadSyllabusData(this.currentSyllabus.id);
      }
    });

    // Quick actions
    $("#exportPlan").off("click").on("click", () => this.exportStudyPlan());
    $("#printPlan").off("click").on("click", () => window.print());
    
    console.log("Dashboard events initialized");
  }

  exportStudyPlan() {
    showModal(
      "Export Study Plan", 
      "This feature will be available soon. Your study plan can be exported as PDF.",
      "OK"
    );
  }
}

// Initialize dashboard
function initializeDashboard() {
  console.log("=== INITIALIZING DASHBOARD ===");
  if ($("#topicsContainer").length) {
    console.log("Dashboard container found, creating Dashboard instance");
    window.dashboard = new Dashboard();
    window.dashboard.loadDashboard();
  } else {
    console.log("Dashboard container NOT found");
  }
}