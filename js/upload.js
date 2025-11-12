// upload.js - FIXED with proper event handling
class UploadPage {
  constructor() {
    this.selectedFile = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    $(document).ready(() => {
      this.bindEvents();
    });
  }

  bindEvents() {
    const uploadZone = $("#uploadZone")[0];
    const fileInput = $("#syllabusFile")[0];

    // File selection - FIXED: Use proper event delegation
    $(uploadZone).on("click", (e) => {
      // Only trigger if clicking on the upload zone itself, not children
      if (e.target === uploadZone || $(e.target).hasClass("upload-zone")) {
        fileInput.click();
      }
    });

    // Drag and drop events - FIXED: Prevent infinite recursion
    $(uploadZone)
      .on("dragover", this.handleDragOver.bind(this))
      .on("dragleave", this.handleDragLeave.bind(this))
      .on("drop", this.handleDrop.bind(this));

    // File input change
    $(fileInput).on("change", (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    // Form submission
    $("#uploadForm").on("submit", (e) => {
      e.preventDefault();
      this.handleUpload();
    });

    // Prevent default behavior on document - FIXED: Use proper event handling
    $(document)
      .on("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
      })
      .on("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
  }

  // Separate methods to prevent recursion
  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#uploadZone").addClass("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Only remove class if leaving the upload zone
    const relatedTarget = e.relatedTarget;
    const uploadZone = $("#uploadZone")[0];
    
    if (!uploadZone.contains(relatedTarget)) {
      $("#uploadZone").removeClass("dragover");
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#uploadZone").removeClass("dragover");

    const files = e.originalEvent.dataTransfer.files;
    if (files.length > 0) {
      this.handleFileSelect(files[0]);
    }
  }

  handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      this.showModal("Invalid File Type", "Please select a PDF file.");
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.showModal("File Too Large", "Please select a file smaller than 10MB.");
      return;
    }

    this.selectedFile = file;
    this.displayFileInfo(file);
    $("#uploadBtn").prop("disabled", false);
  }

  displayFileInfo(file) {
    const fileSize = this.formatFileSize(file.size);
    $("#fileName").text(file.name);
    $("#fileSize").text(fileSize);
    $("#fileInfo").show();
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async handleUpload() {
    if (!this.selectedFile) {
      this.showModal("No File Selected", "Please select a PDF file to upload.");
      return;
    }

    await this.uploadFile(this.selectedFile);
  }

  async uploadFile(file) {
    $("#uploadBtn").prop("disabled", true);
    $("#uploadProgressContainer").show();

    try {
      const formData = new FormData();
      formData.append("file", file);

      // For demo purposes - use actual user email if available
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.email) {
        formData.append("userEmail", user.email);
      } else {
        formData.append("userEmail", "demo@university.edu");
      }

      await this.simulateUploadProgress();

      // Simple upload without auth for testing
      const response = await fetch("http://localhost:8080/api/syllabus/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Upload successful:", result);
        
        this.showModal(
          "Success!",
          "Syllabus uploaded and analyzed successfully!",
          "View Dashboard",
          () => {
            window.location.href = "dashboard.html";
          }
        );
      } else {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      this.showModal("Upload Failed", error.message || "Please try again.");
    } finally {
      $("#uploadBtn").prop("disabled", false);
      $("#uploadProgressContainer").hide();
      $("#uploadProgress").css("width", "0%").text("0%");
    }
  }

  simulateUploadProgress() {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        $("#uploadProgress")
          .css("width", progress + "%")
          .text(Math.round(progress) + "%");

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  }

  showModal(title, content, actionText = "OK", onAction = null) {
    // Use the global showModal function if available, otherwise create a simple alert
    if (typeof window.showModal === 'function') {
      window.showModal(title, content, actionText, onAction);
    } else {
      alert(title + ": " + content);
      if (onAction) onAction();
    }
  }
}

// Initialize upload page
$(document).ready(() => {
  window.uploadPage = new UploadPage();
});