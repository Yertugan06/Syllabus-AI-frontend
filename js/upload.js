// ==========================================
// Upload Page Functionality
// ==========================================
$(document).ready(function () {
  if (!requireAuth()) return;

  const $uploadForm = $("#uploadForm");
  const $progressBar = $(".progress");
  const $progressFill = $("#uploadProgress");

  $uploadForm.on("submit", function (e) {
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

    $progressBar.show();

    SyllabusAPI.upload(formData, function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        $progressFill.css("width", percent + "%").text(percent + "%");
      }
    })
      .done(function (response) {
        localStorage.setItem("currentSyllabusId", response.syllabusId || 1);
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
  });
});
