// Dashboard functionality
class Dashboard {
    constructor() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.userSyllabi = [];
        this.currentSyllabus = null;
        this.completedTopics = new Set();
        
        // Sample data (fallback when no user data available)
        this.sampleData = {
            topics: [
                { id: 1, title: 'Introduction to Web Development', difficulty: 'easy', description: 'HTML, CSS basics' },
                { id: 2, title: 'JavaScript Fundamentals', difficulty: 'medium', description: 'Variables, functions, DOM' },
                { id: 3, title: 'Advanced jQuery', difficulty: 'hard', description: 'AJAX, plugins, optimization' },
                { id: 4, title: 'Bootstrap Framework', difficulty: 'medium', description: 'Grid system, components' },
                { id: 5, title: 'Responsive Design', difficulty: 'easy', description: 'Media queries, mobile-first' },
                { id: 6, title: 'API Integration', difficulty: 'hard', description: 'REST APIs, authentication' }
            ],
            materials: [
                { id: 1, title: 'HTML & CSS Guide.pdf', type: 'PDF', size: '2.5 MB' },
                { id: 2, title: 'JavaScript Exercises', type: 'Code', size: '500 KB' },
                { id: 3, title: 'Bootstrap Documentation', type: 'Link', url: 'https://getbootstrap.com' },
                { id: 4, title: 'jQuery Tutorial Videos', type: 'Video', size: '150 MB' }
            ],
            deadlines: [
                { id: 1, title: 'Project Proposal', date: '2025-11-15', type: 'Assignment' },
                { id: 2, title: 'Midterm Exam', date: '2025-11-20', type: 'Exam' },
                { id: 3, title: 'Final Project Submission', date: '2025-12-10', type: 'Project' },
                { id: 4, title: 'Oral Defense', date: '2025-12-15', type: 'Presentation' }
            ],
            course: {
                title: 'Sample Course - Upload a Syllabus',
                code: 'CS101',
                instructor: 'Your Instructor',
                semester: 'Current Semester'
            }
        };
    }

    // Enhanced dashboard with user-specific data
    async loadDashboard() {
        if (!requireAuth()) return;

        try {
            // Show loading state
            this.showLoadingState();
            
            // Get user's syllabi
            this.userSyllabi = await api.getUserSyllabi();
            
            if (this.userSyllabi.length > 0) {
                // Use the most recent syllabus
                this.currentSyllabus = this.userSyllabi[this.userSyllabi.length - 1];
                this.renderDashboardData(this.currentSyllabus.analysis.extractedData);
            } else {
                // No syllabi uploaded yet
                this.renderEmptyState();
            }
            
            this.initializeDashboardEvents();
            this.updateProgressCounts();
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            // Fallback to sample data
            this.renderDashboardData(this.sampleData);
            this.initializeDashboardEvents();
            this.updateProgressCounts();
        }
    }

    showLoadingState() {
        const loadingHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div><p class="mt-2">Loading your data...</p></div>';
        $('#topicsContainer').html(loadingHTML);
        $('#materialsContainer').html(loadingHTML);
        $('#deadlinesContainer').html(loadingHTML);
    }

    renderDashboardData(data) {
        this.renderTopics(data.topics);
        this.renderMaterials(data.materials);
        this.renderDeadlines(data.deadlines);
        
        // Update course info if elements exist
        if ($('.course-title').length) {
            $('.course-title').text(data.course.title);
            $('.course-code').text(data.course.code);
            $('.course-instructor').text(data.course.instructor);
        }
    }

    renderEmptyState() {
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
        
        $('#topicsContainer').html(emptyStateHTML);
        $('#materialsContainer').html(emptyStateHTML);
        $('#deadlinesContainer').html(emptyStateHTML);
    }

    initializeDashboardEvents() {
        // Search functionality
        $('#dashboardSearch').off('input').on('input', (e) => {
            this.searchQuery = $(e.target).val();
            this.renderTopics();
        });

        // Filter functionality
        $('.filter-btn').off('click').click((e) => {
            $('.filter-btn').removeClass('active');
            $(e.target).addClass('active');
            this.currentFilter = $(e.target).data('filter');
            this.renderTopics();
        });

        // Quick action handlers
        $('#exportPlan').off('click').click(() => {
            this.exportStudyPlan();
        });

        $('#printPlan').off('click').click(() => {
            window.print();
        });

        // Tab change handler
        $('#dashboardTabs a').on('shown.bs.tab', () => {
            this.updateProgressCounts();
        });

        // Syllabus selector if multiple syllabi exist
        if (this.userSyllabi.length > 1) {
            this.renderSyllabusSelector();
        }
    }

    renderSyllabusSelector() {
        const selectorHTML = `
            <div class="card mb-4">
                <div class="card-body">
                    <label class="form-label"><strong>Select Syllabus:</strong></label>
                    <select class="form-select" id="syllabusSelector">
                        ${this.userSyllabi.map((syllabus, index) => `
                            <option value="${index}" ${index === this.userSyllabi.length - 1 ? 'selected' : ''}>
                                ${syllabus.analysis.extractedData.course.title} - ${syllabus.uploadedAt.split('T')[0]}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;
        
        $('#topicsContainer').before(selectorHTML);
        
        $('#syllabusSelector').off('change').change((e) => {
            const selectedIndex = $(e.target).val();
            this.currentSyllabus = this.userSyllabi[selectedIndex];
            this.renderDashboardData(this.currentSyllabus.analysis.extractedData);
            this.updateProgressCounts();
        });
    }

    filterData(items) {
        return items.filter(item => {
            const matchesFilter = this.currentFilter === 'all' || item.difficulty === this.currentFilter;
            const matchesSearch = !this.searchQuery || 
                (item.title && item.title.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
            return matchesFilter && matchesSearch;
        });
    }

    renderTopics(topicsData = null) {
        const topics = topicsData || (this.currentSyllabus ? this.currentSyllabus.analysis.extractedData.topics : this.sampleData.topics);
        const filtered = this.filterData(topics);
        const container = $('#topicsContainer');
        container.empty();

        if (filtered.length === 0) {
            container.append('<p class="text-center text-muted">No topics found matching your filters.</p>');
            return;
        }

        filtered.forEach(topic => {
            const isCompleted = this.completedTopics.has(topic.id);
            const completionClass = isCompleted ? 'completed' : '';
            
            container.append(`
                <div class="list-group-item d-flex justify-content-between align-items-center ${completionClass}" data-difficulty="${topic.difficulty}">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                            <button class="btn btn-sm ${isCompleted ? 'btn-success' : 'btn-outline-secondary'} me-3 topic-complete-btn" data-topic-id="${topic.id}">
                                <i class="fas ${isCompleted ? 'fa-check' : 'fa-circle'}"></i>
                            </button>
                            <div class="flex-grow-1">
                                <h5 class="mb-1">${topic.title}</h5>
                                <p class="mb-0 text-muted">${topic.description}</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>
                                Estimated study time: ${this.getStudyTimeEstimate(topic.difficulty)}
                            </small>
                        </div>
                    </div>
                    <div class="ms-3 text-end">
                        <select class="form-select difficulty-select mb-2" data-id="${topic.id}">
                            <option value="easy" ${topic.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                            <option value="medium" ${topic.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="hard" ${topic.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                        </select>
                        <span class="badge difficulty-badge difficulty-${topic.difficulty}">
                            ${topic.difficulty.toUpperCase()}
                        </span>
                    </div>
                </div>
            `);
        });

        // Handle difficulty change
        $('.difficulty-select').off('change').change((e) => {
            const topicId = $(e.target).data('id');
            const newDifficulty = $(e.target).val();
            this.updateTopicDifficulty(topicId, newDifficulty);
        });

        // Handle topic completion
        $('.topic-complete-btn').off('click').click((e) => {
            const topicId = $(e.target).closest('.topic-complete-btn').data('topic-id');
            this.toggleTopicCompletion(topicId);
        });
    }

    async updateTopicDifficulty(topicId, difficulty) {
        try {
            await api.updateTopicDifficulty(topicId, difficulty);
            
            // Update the badge immediately
            $(`.difficulty-select[data-id="${topicId}"]`).siblings('.difficulty-badge')
                .removeClass('difficulty-easy difficulty-medium difficulty-hard')
                .addClass('difficulty-' + difficulty)
                .text(difficulty.toUpperCase());
                
            showModal('Updated', `Topic difficulty changed to ${difficulty}`);
        } catch (error) {
            console.error('Failed to update difficulty:', error);
            showModal('Error', 'Failed to update topic difficulty. Please try again.');
        }
    }

    toggleTopicCompletion(topicId) {
        if (this.completedTopics.has(topicId)) {
            this.completedTopics.delete(topicId);
        } else {
            this.completedTopics.add(topicId);
        }
        
        // Re-render topics to update completion status
        this.renderTopics();
        this.updateProgressCounts();
    }

    renderMaterials(materialsData = null) {
        const materials = materialsData || (this.currentSyllabus ? this.currentSyllabus.analysis.extractedData.materials : this.sampleData.materials);
        const container = $('#materialsContainer');
        container.empty();

        if (materials.length === 0) {
            container.append('<p class="text-center text-muted">No materials found.</p>');
            return;
        }

        materials.forEach(material => {
            const icon = material.type === 'PDF' ? 'fa-file-pdf text-danger' : 
                        material.type === 'Code' ? 'fa-code text-success' : 
                        material.type === 'Video' ? 'fa-video text-primary' : 'fa-link text-info';
            
            const actionButton = material.url ? 
                `<button class="btn btn-sm btn-primary view-material" data-url="${material.url}">
                    <i class="fas fa-external-link-alt me-1"></i>View
                </button>` :
                `<button class="btn btn-sm btn-outline-secondary" disabled>
                    <i class="fas fa-download me-1"></i>Download
                </button>`;
            
            container.append(`
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <i class="fas ${icon} fa-lg me-3"></i>
                        <div>
                            <h6 class="mb-0">${material.title}</h6>
                            <small class="text-muted">${material.type} • ${material.size || 'External Link'}</small>
                        </div>
                    </div>
                    ${actionButton}
                </div>
            `);
        });

        // Handle material view clicks
        $('.view-material').off('click').click((e) => {
            const url = $(e.target).closest('.view-material').data('url');
            window.open(url, '_blank');
        });
    }

    renderDeadlines(deadlinesData = null) {
        const deadlines = deadlinesData || (this.currentSyllabus ? this.currentSyllabus.analysis.extractedData.deadlines : this.sampleData.deadlines);
        const container = $('#deadlinesContainer');
        container.empty();

        if (deadlines.length === 0) {
            container.append('<p class="text-center text-muted">No deadlines found.</p>');
            return;
        }

        deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

        deadlines.forEach(deadline => {
            const daysUntil = Math.ceil((new Date(deadline.date) - new Date()) / (1000 * 60 * 60 * 24));
            let urgency, urgencyText;
            
            if (daysUntil < 0) {
                urgency = 'secondary';
                urgencyText = 'Overdue';
            } else if (daysUntil < 7) {
                urgency = 'danger';
                urgencyText = `${daysUntil} days`;
            } else if (daysUntil < 14) {
                urgency = 'warning';
                urgencyText = `${daysUntil} days`;
            } else {
                urgency = 'success';
                urgencyText = `${daysUntil} days`;
            }

            const typeIcon = deadline.type === 'Exam' ? 'fa-file-alt' :
                            deadline.type === 'Assignment' ? 'fa-tasks' :
                            deadline.type === 'Project' ? 'fa-project-diagram' : 'fa-calendar';

            container.append(`
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="d-flex align-items-center mb-1">
                            <i class="fas ${typeIcon} me-2 text-muted"></i>
                            <h6 class="mb-0">${deadline.title}</h6>
                        </div>
                        <small class="text-muted">
                            <i class="fas fa-calendar-alt me-1"></i>${new Date(deadline.date).toLocaleDateString()}
                            <span class="badge bg-light text-dark ms-2">${deadline.type}</span>
                        </small>
                    </div>
                    <span class="badge bg-${urgency}">${urgencyText}</span>
                </div>
            `);
        });
    }

    getStudyTimeEstimate(difficulty) {
        const estimates = {
            'easy': '2-4 hours',
            'medium': '4-8 hours', 
            'hard': '8-12 hours'
        };
        return estimates[difficulty] || 'Varies';
    }

    updateProgressCounts() {
        const topics = this.currentSyllabus ? this.currentSyllabus.analysis.extractedData.topics : this.sampleData.topics;
        const materials = this.currentSyllabus ? this.currentSyllabus.analysis.extractedData.materials : this.sampleData.materials;
        const deadlines = this.currentSyllabus ? this.currentSyllabus.analysis.extractedData.deadlines : this.sampleData.deadlines;
        
        $('#totalTopicsCount').text(topics.length);
        $('#totalMaterials').text(materials.length);
        $('#completedTopics').text(this.completedTopics.size);
        
        // Calculate upcoming deadlines (within next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcoming = deadlines.filter(d => {
            const deadlineDate = new Date(d.date);
            return deadlineDate >= now && deadlineDate <= thirtyDaysFromNow;
        });
        $('#upcomingDeadlines').text(upcoming.length);
    }

    exportStudyPlan() {
        showModal('Export Study Plan', 'Your study plan will be exported as a PDF document.', 'Export', () => {
            // Simulate export process
            setTimeout(() => {
                showModal('Export Complete', 'Your study plan has been exported successfully!', 'Download', () => {
                    // In a real app, this would trigger the download
                    console.log('Study plan download triggered');
                });
            }, 1500);
        });
    }
}

// Dashboard initialization
function initializeDashboard() {
    if (typeof Dashboard !== 'undefined' && $('body').has('#topicsContainer').length) {
        window.dashboard = new Dashboard();
        window.dashboard.loadDashboard();
    }
}

// Update the main initialization in main.js
$(document).ready(function() {
    initializeDemoData();
    updateNavigation();
    initializeDashboard();
});