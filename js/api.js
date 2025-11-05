// API Service for backend communication
class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.isDemoMode = true; // Force demo mode for client-side only
    }

    async request(endpoint, options = {}) {
        // Always use mock responses for demo mode
        return this.mockRequest(endpoint, options);
    }

    // Mock responses for demo mode
    async mockRequest(endpoint, options) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock endpoints
        const mockEndpoints = {
            '/api/auth/login': () => this.mockLogin(options.body),
            '/api/auth/register': () => this.mockRegister(options.body),
            '/api/auth/me': () => this.mockGetCurrentUser(),
            '/api/syllabus/upload': () => this.mockUploadSyllabus(options.body),
            '/api/user/syllabi': () => this.mockGetUserSyllabi(),
            '/api/admin/stats': () => this.mockGetAdminStats(),
            '/api/admin/activity': () => this.mockGetAdminActivity()
        };

        const handler = mockEndpoints[endpoint];
        if (handler) {
            return handler();
        }

        throw new Error(`Mock endpoint not found: ${endpoint}`);
    }

    // Mock authentication methods - FIXED VERSION
    mockLogin(body) {
        try {
            const { email, password } = typeof body === 'string' ? JSON.parse(body) : body;
            const users = this.getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                const token = this.generateToken();
                this.saveToken(token, user);
                
                return {
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                };
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            throw new Error('Invalid login request');
        }
    }

    mockRegister(body) {
        try {
            const { email, password } = typeof body === 'string' ? JSON.parse(body) : body;
            const users = this.getUsers();
            
            if (users.find(u => u.email === email)) {
                throw new Error('Email already registered');
            }

            const newUser = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                email,
                password,
                name: email.split('@')[0],
                role: 'user',
                createdAt: new Date().toISOString(),
                isActive: true
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            const token = this.generateToken();
            this.saveToken(token, newUser);

            return {
                success: true,
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role
                }
            };
        } catch (error) {
            throw new Error('Invalid registration request');
        }
    }

    mockGetCurrentUser() {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('currentUser');
        
        if (!token || !userData) {
            throw new Error('Not authenticated');
        }

        return {
            success: true,
            user: JSON.parse(userData)
        };
    }

    // Mock data management
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    generateToken() {
        return 'demo_token_' + Math.random().toString(36).substr(2, 16);
    }

    saveToken(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }));
    }

    // Mock syllabus methods
    mockUploadSyllabus(formData) {
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const newUpload = {
            id: 'upload_' + Math.random().toString(36).substr(2, 9),
            fileName: 'syllabus.pdf',
            userId: user.id,
            uploadedAt: new Date().toISOString(),
            status: 'completed',
            analysis: {
                topics: Math.floor(Math.random() * 10) + 5,
                materials: Math.floor(Math.random() * 5) + 3,
                deadlines: Math.floor(Math.random() * 4) + 2,
                extractedData: this.generateMockSyllabusData()
            }
        };
        
        uploads.push(newUpload);
        localStorage.setItem('uploads', JSON.stringify(uploads));

        return {
            success: true,
            upload: newUpload
        };
    }

    mockGetUserSyllabi() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        
        return uploads.filter(upload => upload.userId === user.id);
    }

    generateMockSyllabusData() {
        const courses = [
            {
                title: 'Introduction to Computer Science',
                code: 'CS101',
                instructor: 'Dr. Smith',
                semester: 'Fall 2024'
            },
            {
                title: 'Web Development Fundamentals',
                code: 'WD101',
                instructor: 'Prof. Johnson',
                semester: 'Spring 2024'
            },
            {
                title: 'Data Structures and Algorithms',
                code: 'CS201',
                instructor: 'Dr. Williams',
                semester: 'Fall 2024'
            }
        ];

        const randomCourse = courses[Math.floor(Math.random() * courses.length)];

        return {
            course: randomCourse,
            topics: [
                { id: 1, title: 'Programming Fundamentals', difficulty: 'easy', description: 'Basic programming concepts and syntax' },
                { id: 2, title: 'Data Structures', difficulty: 'medium', description: 'Arrays, lists, and basic data organization' },
                { id: 3, title: 'Algorithms', difficulty: 'hard', description: 'Sorting, searching, and algorithm analysis' },
                { id: 4, title: 'Object-Oriented Programming', difficulty: 'medium', description: 'Classes, objects, and inheritance' },
                { id: 5, title: 'Database Concepts', difficulty: 'medium', description: 'SQL, normalization, and database design' }
            ],
            materials: [
                { id: 1, title: 'Textbook Chapter 1', type: 'PDF', size: '2.1 MB' },
                { id: 2, title: 'Programming Exercises', type: 'Code', size: '150 KB' },
                { id: 3, title: 'Lecture Slides Week 1', type: 'PDF', size: '3.5 MB' },
                { id: 4, title: 'Reference Documentation', type: 'Link', url: 'https://developer.mozilla.org' }
            ],
            deadlines: [
                { id: 1, title: 'Assignment 1', date: this.getFutureDate(7), type: 'Assignment' },
                { id: 2, title: 'Midterm Exam', date: this.getFutureDate(21), type: 'Exam' },
                { id: 3, title: 'Final Project', date: this.getFutureDate(45), type: 'Project' },
                { id: 4, title: 'Quiz 1', date: this.getFutureDate(3), type: 'Quiz' }
            ]
        };
    }

    getFutureDate(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0];
    }

    // Mock admin methods
    mockGetAdminStats() {
        const users = this.getUsers();
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        
        return {
            totalUsers: users.length,
            totalUploads: uploads.length,
            activeUsers: users.filter(u => u.isActive).length,
            systemErrors: Math.floor(Math.random() * 5),
            storageUsed: (uploads.length * 2.5).toFixed(1) + ' MB'
        };
    }

    mockGetAdminActivity() {
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        const users = this.getUsers();
        
        return uploads.slice(-10).reverse().map(upload => {
            const user = users.find(u => u.id === upload.userId);
            return {
                id: upload.id,
                action: 'upload',
                description: `Syllabus uploaded by ${user?.email || 'Unknown'}`,
                timestamp: upload.uploadedAt,
                fileName: upload.fileName
            };
        });
    }

    // Authentication endpoints
    async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(email, password) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    // Syllabus endpoints
    async uploadSyllabus(formData) {
        return this.request('/api/syllabus/upload', {
            method: 'POST',
            body: formData
        });
    }

    async getUserSyllabi() {
        return this.request('/api/user/syllabi');
    }

    // Topic management
    async updateTopicDifficulty(topicId, difficulty) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Updated topic ${topicId} difficulty to ${difficulty}`);
                resolve({ success: true });
            }, 500);
        });
    }

    // Admin endpoints
    async getAdminStats() {
        return this.request('/api/admin/stats');
    }

    async getAdminActivity() {
        return this.request('/api/admin/activity');
    }
}

// Create global API instance
const api = new ApiService('http://localhost:8080');