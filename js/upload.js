// Upload functionality
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
        // File selection
        $('#uploadZone').on('click', (e) => {
            // Only trigger if clicking on the upload zone itself, not children
            if (e.target === $('#uploadZone')[0] || $(e.target).hasClass('upload-zone')) {
                $('#syllabusFile').click();
            }
        });

        // Drag and drop events - FIXED: Use proper event handling
        $('#uploadZone')
            .on('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                $('#uploadZone').addClass('dragover');
            })
            .on('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only remove class if leaving the upload zone
                if (e.relatedTarget === null || !$('#uploadZone').has(e.relatedTarget).length) {
                    $('#uploadZone').removeClass('dragover');
                }
            })
            .on('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                $('#uploadZone').removeClass('dragover');
                
                const files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });

        // File input change
        $('#syllabusFile').on('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Form submission
        $('#uploadForm').on('submit', (e) => {
            e.preventDefault();
            this.handleUpload();
        });

        // Prevent default behavior on document for drag/drop
        $(document).on('dragover drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            showModal('Invalid File Type', 'Please select a PDF file.');
            return;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showModal('File Too Large', 'Please select a file smaller than 10MB.');
            return;
        }

        this.selectedFile = file;
        this.displayFileInfo(file);
        $('#uploadBtn').prop('disabled', false);
    }

    displayFileInfo(file) {
        const fileSize = this.formatFileSize(file.size);
        
        $('#fileName').text(file.name);
        $('#fileSize').text(fileSize);
        $('#fileInfo').show();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async handleUpload() {
        if (!this.selectedFile) {
            showModal('No File Selected', 'Please select a PDF file to upload.');
            return;
        }

        await this.uploadFile(this.selectedFile);
    }

    async uploadFile(file) {
        $('#uploadBtn').prop('disabled', true);
        $('#uploadProgressContainer').show();

        try {
            // Simulate upload progress
            await this.simulateUploadProgress();
            
            const response = await api.uploadSyllabus(file);
            
            showModal('Upload Successful!', 'Your syllabus has been analyzed. View results in the dashboard.', 'View Dashboard', () => {
                window.location.href = 'dashboard.html';
            });
            
        } catch (error) {
            console.error('Upload failed:', error);
            showModal('Upload Failed', 'There was an error uploading your syllabus. Please try again.');
        } finally {
            $('#uploadBtn').prop('disabled', false);
            $('#uploadProgressContainer').hide();
        }
    }

    simulateUploadProgress() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;

                $('#uploadProgress')
                    .css('width', progress + '%')
                    .text(Math.round(progress) + '%');

                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 200);
        });
    }
}

// Initialize upload page
$(document).ready(() => {
    window.uploadPage = new UploadPage();
});