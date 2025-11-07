// SIMPLE API MOCK
const api = {
    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    const { password: _, ...userWithoutPassword } = user;
                    localStorage.setItem('token', 'demo-token-' + Date.now());
                    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
                    resolve({ user: userWithoutPassword });
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    },

    async register(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                if (users.find(u => u.email === email)) {
                    reject(new Error('User already exists'));
                    return;
                }

                const newUser = {
                    id: 'user_' + Date.now(),
                    email: email,
                    password: password,
                    name: email.split('@')[0],
                    role: 'user',
                    createdAt: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                const { password: _, ...userWithoutPassword } = newUser;
                localStorage.setItem('token', 'demo-token-' + Date.now());
                localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
                
                resolve({ user: userWithoutPassword });
            }, 1000);
        });
    }
};

// COMPONENT LOADER
function loadComponent(containerId, componentPath) {
    return new Promise((resolve, reject) => {
        $.get(componentPath)
            .done(function(data) {
                $('#' + containerId).html(data);
                resolve(data);
            })
            .fail(function(error) {
                console.error('Failed to load component:', componentPath, error);
                
                // Create fallback content based on component type
                let fallbackContent = '';
                
                if (componentPath.includes('navbar')) {
                    fallbackContent = `
                        <nav class="navbar navbar-expand-lg navbar-light fixed-top">
                            <div class="container">
                                <a class="navbar-brand" href="index.html">
                                    <i class="fas fa-graduation-cap"></i> Syllabus AI
                                </a>
                                <div class="navbar-nav ms-auto">
                                    <a class="nav-link" href="login.html">Login</a>
                                    <a class="nav-link" href="register.html">Register</a>
                                </div>
                            </div>
                        </nav>
                    `;
                } else if (componentPath.includes('footer')) {
                    fallbackContent = `
                        <footer class="bg-dark text-light py-4 mt-5">
                            <div class="container text-center">
                                <p class="mb-0">&copy; 2024 Syllabus AI. All rights reserved.</p>
                            </div>
                        </footer>
                    `;
                }
                
                $('#' + containerId).html(fallbackContent);
                resolve(fallbackContent);
            });
    });
}

// AUTH MANAGER
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
    $('#modalContent').html(content);
    $('#modalAction').text(actionText);
    
    $('#modalAction').off('click').click(function() {
        if (onAction) onAction();
        $('#customModal').removeClass('active');
    });
    
    $('#modalClose').off('click').click(function() {
        $('#customModal').removeClass('active');
    });
    
    $('#customModal').addClass('active');
}

// Enhanced theme initialization
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    
    if (isDark) {
        $('body').addClass('dark-mode');
        $('.theme-toggle i').removeClass('fa-moon').addClass('fa-sun');
    } else {
        $('body').removeClass('dark-mode');
        $('.theme-toggle i').removeClass('fa-sun').addClass('fa-moon');
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
        const $slides = $('.carousel-slide');
        this.totalSlides = $slides.length;
        
        console.log('Carousel setup:', this.totalSlides, 'slides found');

        if (this.totalSlides === 0) {
            console.warn('No carousel slides found');
            return;
        }

        this.createIndicators();
        this.updateCarousel();
    }

    createIndicators() {
        const $indicators = $('#carouselIndicators');
        $indicators.empty();

        for (let i = 0; i < this.totalSlides; i++) {
            $indicators.append(`<div class="carousel-indicator ${i === 0 ? 'active' : ''}" data-slide="${i}"></div>`);
        }
    }

    bindEvents() {
        // Next button
        $('#carouselNext').off('click').click((e) => {
            e.preventDefault();
            e.stopPropagation();
            this.nextSlide();
        });

        // Previous button
        $('#carouselPrev').off('click').click((e) => {
            e.preventDefault();
            e.stopPropagation();
            this.prevSlide();
        });

        // Indicator clicks
        $(document).off('click', '.carousel-indicator').on('click', '.carousel-indicator', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const slideIndex = parseInt($(e.target).data('slide'));
            this.goToSlide(slideIndex);
        });

        // Pause on hover (desktop only)
        if (!this.isTouchDevice()) {
            $('.custom-carousel').hover(
                () => this.stopAutoAdvance(),
                () => this.startAutoAdvance()
            );
        }

        // Handle window resize
        $(window).on('resize', () => {
            this.updateCarousel();
        });
    }

    bindTouchEvents() {
        const $carousel = $('.custom-carousel');
        const $slidesContainer = $('#carouselSlides');

        // Prevent default touch behaviors
        $carousel.on('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });

        // Touch events
        $slidesContainer.on('touchstart', (e) => {
            this.handleTouchStart(e.originalEvent);
        });

        $slidesContainer.on('touchmove', (e) => {
            this.handleTouchMove(e.originalEvent);
        });

        $slidesContainer.on('touchend', (e) => {
            this.handleTouchEnd(e.originalEvent);
        });

        // Mouse events for desktop testing
        $slidesContainer.on('mousedown', (e) => {
            this.handleMouseDown(e);
        });

        $(document).on('mousemove', (e) => {
            if (this.isDragging) {
                this.handleMouseMove(e);
            }
        });

        $(document).on('mouseup', (e) => {
            if (this.isDragging) {
                this.handleMouseUp(e);
            }
        });

        // Prevent image drag
        $slidesContainer.find('img').on('dragstart', (e) => {
            e.preventDefault();
        });
    }

    handleTouchStart(e) {
        this.stopAutoAdvance();
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.currentX = this.startX;
        
        $('#carouselSlides').css('transition', 'none');
        $('.custom-carousel').css('cursor', 'grabbing');
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.touches[0].clientX;
        const diff = this.currentX - this.startX;
        
        // Only prevent default if we're actually dragging
        if (Math.abs(diff) > 5) {
            e.preventDefault();
        }
        
        const translateX = -this.currentSlide * 100 + (diff / this.getCarouselWidth()) * 100;
        $('#carouselSlides').css('transform', `translateX(${translateX}%)`);
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        $('.custom-carousel').css('cursor', '');
        $('#carouselSlides').css('transition', 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)');
        
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
        
        $('#carouselSlides').css('transition', 'none');
        $('.custom-carousel').css('cursor', 'grabbing');
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.clientX;
        const diff = this.currentX - this.startX;
        const translateX = -this.currentSlide * 100 + (diff / this.getCarouselWidth()) * 100;
        $('#carouselSlides').css('transform', `translateX(${translateX}%)`);
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        $('.custom-carousel').css('cursor', '');
        $('#carouselSlides').css('transition', 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)');
        
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
        return $('.custom-carousel').width() || window.innerWidth;
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
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
        $('#carouselSlides').css('transform', `translateX(${translateX}%)`);
        
        // Update indicators
        $('.carousel-indicator').removeClass('active');
        $(`.carousel-indicator[data-slide="${this.currentSlide}"]`).addClass('active');
        
        // Add slide change animation class
        $('#carouselSlides').addClass('sliding');
        setTimeout(() => {
            $('#carouselSlides').removeClass('sliding');
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
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
    }
}

// Initialize everything
$(document).ready(function() {
    console.log('Initializing application...');
    
    initializeTheme();
    
    // Load navbar if container exists
    if ($('#navbar-container').length) {
        loadComponent('navbar-container', 'components/navbar.html')
            .then(() => {
                console.log('Navbar loaded successfully');
                initializeDemoData();
                updateNavigation();
                
                // Theme toggle
                $(document).on('click', '#themeToggle', function() {
                    $('body').toggleClass('dark-mode');
                    const isDark = $('body').hasClass('dark-mode');
                    localStorage.setItem('theme', isDark ? 'dark' : 'light');
                    
                    const $icon = $(this).find('i');
                    if (isDark) {
                        $icon.removeClass('fa-moon').addClass('fa-sun');
                    } else {
                        $icon.removeClass('fa-sun').addClass('fa-moon');
                    }
                });
                
                // Logout
                $(document).on('click', '#navLogout', function(e) {
                    e.preventDefault();
                    AuthManager.logout();
                });
            })
            .catch(error => {
                console.error('Failed to load navbar:', error);
            });
    } else {
        initializeDemoData();
    }
    
    // Load footer if container exists
    if ($('#footer-container').length) {
        loadComponent('footer-container', 'components/footer.html')
            .then(() => {
                console.log('Footer loaded successfully');
            })
            .catch(error => {
                console.error('Failed to load footer:', error);
            });
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
        
        // Initialize carousel
        if ($('.custom-carousel').length) {
            console.log('Initializing enhanced carousel...');
            window.carousel = new Carousel();
        }
    }
});