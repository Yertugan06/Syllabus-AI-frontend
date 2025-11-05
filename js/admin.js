// Admin functionality
class AdminPage {
    constructor() {
        // Check admin access immediately
        if (!this.checkAdminAccess()) {
            return;
        }
        this.initializeEventListeners();
    }

    checkAdminAccess() {
        const user = AuthManager.getCurrentUser();
        if (!AuthManager.isAdmin()) {
            showModal('Access Denied', 'You must be an administrator to access this page.', 'OK', () => {
                window.location.href = 'dashboard.html';
            });
            return false;
        }
        return true;
    }

    initializeEventListeners() {
        $(document).ready(() => {
            if (!this.checkAdminAccess()) return;
            
            this.bindEvents();
            this.loadAdminData();
            this.startSystemMonitoring();
        });
    }

    bindEvents() {
        // User management actions (delegated)
        $(document).on('click', '.view-user-btn', (e) => {
            this.viewUserDetails(e);
        });

        $(document).on('click', '.suspend-user-btn', (e) => {
            this.suspendUser(e);
        });
    }

    async loadAdminData() {
        try {
            const stats = await api.getAdminStats();
            this.updateStats(stats);
            this.loadUsersTable();
            this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading admin data:', error);
            this.loadFallbackData();
        }
    }

    updateStats(stats) {
        this.animateCounter('#uploadCount', stats.totalUploads || 0);
        this.animateCounter('#usersCount', stats.totalUsers || 0);
        this.animateCounter('#errorsCount', stats.systemErrors || 0);
        this.animateCounter('#activeCount', stats.activeUsers || 0);
    }

    loadUsersTable() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        const container = $('#usersTable');
        
        if (users.length === 0) {
            container.html('<tr><td colspan="6" class="text-center text-muted">No users found</td></tr>');
            return;
        }

        const usersHTML = users.map(user => {
            const userUploads = uploads.filter(upload => upload.userId === user.id);
            const status = user.isActive !== false ? 'Active' : 'Suspended';
            const statusClass = user.isActive !== false ? 'success' : 'secondary';
            
            return `
                <tr>
                    <td>${user.id.substring(0, 8)}...</td>
                    <td>${user.email}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>${userUploads.length}</td>
                    <td><span class="badge bg-${statusClass}">${status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-user-btn" data-user-id="${user.id}">View</button>
                        <button class="btn btn-sm btn-outline-danger suspend-user-btn" data-user-id="${user.id}">
                            ${user.isActive !== false ? 'Suspend' : 'Activate'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        container.html(usersHTML);
    }

    loadRecentActivity() {
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        const container = $('#adminActivityLog');
        
        // Clear existing items
        container.empty();

        // Add real activities from uploads
        uploads.slice(-5).reverse().forEach(upload => {
            const date = new Date(upload.uploadedAt);
            const timeAgo = this.getTimeAgo(date);
            
            container.prepend(`
                <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                        <strong><i class="fas fa-upload me-2 text-primary"></i>Syllabus uploaded</strong>
                        <span class="text-muted">${timeAgo}</span>
                    </div>
                    <small>File: ${upload.fileName}</small>
                </div>
            `);
        });

        if (uploads.length === 0) {
            container.append('<p class="text-center text-muted">No recent activity</p>');
        }
    }

    loadFallbackData() {
        // Fallback to localStorage data
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        
        this.animateCounter('#uploadCount', uploads.length);
        this.animateCounter('#usersCount', users.length);
        this.animateCounter('#errorsCount', Math.floor(Math.random() * 5));
        this.animateCounter('#activeCount', Math.floor(users.length * 0.7));
        
        this.loadUsersTable();
        this.loadRecentActivity();
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    }

    animateCounter(selector, target) {
        let current = 0;
        const increment = Math.ceil(target / 30);
        const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            $(selector).text(current);
        }, 50);
    }

    viewUserDetails(e) {
        const userId = $(e.target).data('user-id');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (user) {
            showModal('User Details', 
                `Email: ${user.email}<br>
                 Role: ${user.role}<br>
                 Registered: ${new Date(user.createdAt).toLocaleDateString()}<br>
                 Status: ${user.isActive !== false ? 'Active' : 'Suspended'}`,
                'Close'
            );
        }
    }

    suspendUser(e) {
        const userId = $(e.target).data('user-id');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            const user = users[userIndex];
            const newStatus = user.isActive !== false ? false : true;
            
            users[userIndex].isActive = newStatus;
            localStorage.setItem('users', JSON.stringify(users));
            
            showModal('User Updated', 
                `User ${user.email} has been ${newStatus ? 'activated' : 'suspended'}.`,
                'OK',
                () => {
                    this.loadUsersTable();
                }
            );
        }
    }

    startSystemMonitoring() {
        // Simulate system metrics updates
        setInterval(() => {
            this.updateSystemMetrics();
        }, 10000);
    }

    updateSystemMetrics() {
        // Randomly update system metrics for demo
        const metrics = [
            { selector: '.progress-bar.bg-success', min: 85, max: 98 },
            { selector: '.progress-bar.bg-info', min: 75, max: 92 },
            { selector: '.progress-bar.bg-warning', min: 65, max: 85 },
            { selector: '.progress-bar.bg-danger', min: 55, max: 75 }
        ];

        metrics.forEach(metric => {
            const newValue = Math.floor(Math.random() * (metric.max - metric.min + 1)) + metric.min;
            $(metric.selector)
                .css('width', newValue + '%')
                .text(newValue + '%');
        });
    }
}

// Initialize admin page
$(document).ready(() => {
    window.adminPage = new AdminPage();
});