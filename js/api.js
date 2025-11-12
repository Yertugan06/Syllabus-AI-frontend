class ApiService {
  constructor(baseUrl = "http://localhost:8080/api") {
    this.baseUrl = baseUrl;
    console.log("ApiService initialized with baseUrl:", baseUrl);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log("=== API REQUEST ===");
    console.log("URL:", url);
    console.log("Method:", options.method || "GET");
    
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Token added to request");
    } else {
      console.log("No token found");
    }

    try {
      console.log("Sending request...");
      const response = await fetch(url, config);
      console.log("Response status:", response.status);
      console.log("Response headers:", Array.from(response.headers.entries()));

      // Handle unauthorized (redirect to login)
      if (response.status === 401) {
        console.error("Unauthorized - clearing auth and redirecting");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
        throw new Error("Authentication required");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Request failed:", response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // For empty responses
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Response data:", data);
        return data;
      } else {
        console.log("Empty or non-JSON response");
        return { success: true };
      }
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email, password) {
    console.log("=== LOGIN REQUEST ===");
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    console.log("=== REGISTER REQUEST ===");
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    console.log("=== GET CURRENT USER ===");
    return this.request("/auth/me");
  }

  // Syllabus endpoints
  async uploadSyllabus(formData) {
    console.log("=== UPLOAD SYLLABUS ===");
    const url = `${this.baseUrl}/syllabus/upload`;
    const token = localStorage.getItem("token");

    console.log("Upload URL:", url);
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    console.log("Upload response status:", response.status);

    if (response.status === 401) {
      console.error("Unauthorized upload");
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
      throw new Error("Authentication required");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed:", errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("Upload successful:", result);
    return result;
  }

  async getUserSyllabi() {
    console.log("=== GET USER SYLLABI ===");
    const result = await this.request("/syllabus/user");
    console.log("User syllabi:", result);
    return result;
  }

  async getSyllabus(id) {
    console.log("=== GET SYLLABUS ===", id);
    return this.request(`/syllabus/${id}`);
  }

  async getSyllabusTopics(syllabusId) {
    console.log("=== GET SYLLABUS TOPICS ===", syllabusId);
    const result = await this.request(`/syllabus/${syllabusId}/topics`);
    console.log("Topics result:", result);
    return result;
  }

  async getSyllabusMaterials(syllabusId) {
    console.log("=== GET SYLLABUS MATERIALS ===", syllabusId);
    const result = await this.request(`/syllabus/${syllabusId}/materials`);
    console.log("Materials result:", result);
    return result;
  }

  async getSyllabusDeadlines(syllabusId) {
    console.log("=== GET SYLLABUS DEADLINES ===", syllabusId);
    const result = await this.request(`/syllabus/${syllabusId}/deadlines`);
    console.log("Deadlines result:", result);
    return result;
  }

  async deleteSyllabus(id) {
    console.log("=== DELETE SYLLABUS ===", id);
    return this.request(`/syllabus/${id}`, {
      method: "DELETE",
    });
  }

  // User profile
  async getUserProfile() {
    console.log("=== GET USER PROFILE ===");
    return this.request("/user/profile");
  }

  async updateUserPreferences(preferences) {
    console.log("=== UPDATE USER PREFERENCES ===");
    return this.request("/user/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }

  // Mock data for fallback
  getMockSyllabusData() {
    console.log("Using mock syllabus data");
    return {
      id: 1,
      fileName: "sample_syllabus.pdf",
      uploadDate: new Date().toISOString(),
      analysis: {
        extractedData: {
          topics: [
            {
              id: 1,
              title: "Introduction to Course",
              description: "Course overview and objectives",
              week: 1,
              difficultyLevel: "EASY"
            },
            {
              id: 2,
              title: "Basic Concepts",
              description: "Fundamental principles and theories",
              week: 2,
              difficultyLevel: "MEDIUM"
            },
            {
              id: 3,
              title: "Advanced Topics",
              description: "Complex theories and applications",
              week: 3,
              difficultyLevel: "HARD"
            }
          ],
          materials: [
            {
              id: 1,
              title: "Textbook Chapter 1",
              type: "READING",
              url: "#"
            },
            {
              id: 2,
              title: "Video Lecture",
              type: "VIDEO",
              url: "#"
            }
          ],
          deadlines: [
            {
              id: 1,
              title: "Assignment 1",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              type: "ASSIGNMENT",
              description: "First homework assignment"
            },
            {
              id: 2,
              title: "Midterm Exam",
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              type: "EXAM",
              description: "Midterm examination"
            }
          ]
        }
      }
    };
  }
}

// Create global API instance
const api = new ApiService("http://localhost:8080/api");
console.log("Global API instance created");