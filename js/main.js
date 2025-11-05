// SIMPLE AUTH MANAGER
const AuthManager = {
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('currentUser');
        return !!(token && user);
    },

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser') || '{}');
        } catch {
            return {};
        }
    },

    async login(email, password) {
        try {
            const result = await api.login(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async register(email, password) {
        try {
            const result = await api.register(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userEmail');
        window.location.href = 'index.html';
    },

    hasRole(role) {
        const user = this.getCurrentUser();
        return user.role === role;
    },

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }
};

// Initialize demo data
function initializeDemoData() {
    if (!localStorage.getItem('app_initialized')) {
        console.log('Creating demo users...');
        
        const demoUsers = [
            {
                id: 'demo_admin',
                email: 'admin@syllabusai.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo_student', 
                email: 'student@university.edu',
                password: 'student123',
                name: 'Demo Student',
                role: 'user',
                createdAt: new Date().toISOString()
            }
            // Removed professor account
        ];

        localStorage.setItem('users', JSON.stringify(demoUsers));
        localStorage.setItem('app_initialized', 'true');
        console.log('Demo users created successfully!');
        console.log('Admin: admin@syllabusai.com / admin123');
        console.log('Student: student@university.edu / student123');
    }
}

// Update navigation
function updateNavigation() {
    const isLoggedIn = AuthManager.isAuthenticated();
    
    if (isLoggedIn) {
        $('#navLogin, #navRegister').hide();
        $('#navUserMenu').show();
        
        const user = AuthManager.getCurrentUser();
        $('#userEmail').text(user.email);
        $('#userDisplayName').text(user.name);
        
        // Only show admin link for admin users
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
        showModal('Authentication Required', 'Please log in to access this page.', 'Login', () => {
            window.location.href = 'login.html';
        });
        return false;
    }

    // Check role if specified
    if (requiredRole && !AuthManager.hasRole(requiredRole)) {
        showModal('Access Denied', 'You do not have permission to access this page.', 'OK', () => {
            window.location.href = 'dashboard.html';
        });
        return false;
    }

    return true;
}

// Simple modal function
function showModal(title, content, actionText = 'OK', onAction = null) {
    $('#modalTitle').text(title);
    $('#modalContent').text(content);
    $('#modalAction').text(actionText);
    
    $('#modalAction').off('click').click(function() {
        if (onAction) onAction();
        $('#customModal').removeClass('active');
    });
    
    $('#customModal').addClass('active');
}

// Initialize everything
$(document).ready(function() {
    console.log('Initializing application...');
    
    // Load navbar if container exists
    if ($('#navbar-container').length) {
        $('#navbar-container').load('components/navbar.html', function() {
            console.log('Navbar loaded');
            initializeDemoData();
            updateNavigation();
            
            // Theme toggle
            $('#themeToggle').click(function() {
                $('body').toggleClass('dark-mode');
                const isDark = $('body').hasClass('dark-mode');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                $(this).find('i').toggleClass('fa-moon fa-sun');
            });
            
            // Logout
            $(document).on('click', '#navLogout', function(e) {
                e.preventDefault();
                AuthManager.logout();
            });
            
            // Initialize theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                $('body').addClass('dark-mode');
                $('#themeToggle i').removeClass('fa-moon').addClass('fa-sun');
            }
        });
    } else {
        // If no navbar container, still initialize demo data
        initializeDemoData();
    }
    
    // Modal close handlers
    $(document).on('click', '#modalClose', function() {
        $('#customModal').removeClass('active');
    });
    
    $(document).on('click', '#customModal', function(e) {
        if (e.target === this) {
            $('#customModal').removeClass('active');
        }
    });
    
    // Home page specific initialization
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        $('#learnMoreBtn').click(function() {
            showModal('About Syllabus AI', 'Syllabus AI helps students and educators organize course materials efficiently using artificial intelligence. Upload your syllabus and let our system extract topics, deadlines, and materials automatically!');
        });
    }
});