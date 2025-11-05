// SIMPLE LOGIN PAGE
class LoginPage {
    constructor() {
        this.init();
    }

    init() {
        console.log('Login page initialized');
        
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const password = urlParams.get('password');
        
        if (email && password) {
            $('#loginEmail').val(email);
            $('#loginPassword').val(password);
            setTimeout(() => this.handleLogin(), 100);
        }
        
        this.bindEvents();
    }

    bindEvents() {
        console.log('Binding login events...');
        
        // Password toggle
        $('.toggle-password').click((e) => {
            const target = $(e.target).closest('.toggle-password').data('target');
            const input = $('#' + target);
            const icon = $(e.target).closest('.toggle-password').find('i');
            
            if (input.attr('type') === 'password') {
                input.attr('type', 'text');
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                input.attr('type', 'password');
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });

        // Demo login buttons
        $('.demo-login').click((e) => {
            console.log('Demo login clicked');
            const email = $(e.target).closest('.demo-login').data('email');
            const password = $(e.target).closest('.demo-login').data('password');
            
            $('#loginEmail').val(email);
            $('#loginPassword').val(password);
            this.handleLogin();
        });

        // Form submission - FIXED: Use direct binding
        $('#loginForm').on('submit', (e) => {
            e.preventDefault();
            console.log('Login form submitted directly');
            this.handleLogin();
        });
        
        // Also bind click event to button for extra safety
        $('#loginBtn').click((e) => {
            e.preventDefault();
            console.log('Login button clicked directly');
            this.handleLogin();
        });
    }

    async handleLogin() {
        console.log('Handling login...');
        
        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();

        console.log('Login credentials:', { email, password });

        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        // Show loading
        $('#loginBtn').prop('disabled', true);
        $('#loginSpinner').removeClass('d-none');

        try {
            console.log('Calling AuthManager.login...');
            const result = await AuthManager.login(email, password);
            console.log('AuthManager result:', result);
            
            if (result.success) {
                console.log('Login successful, redirecting...');
                showModal('Success!', `Welcome back, ${result.user.name}!`, 'Continue', () => {
                    window.location.href = 'dashboard.html';
                });
            } else {
                console.log('Login failed:', result.error);
                showModal('Login Failed', result.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            showModal('Login Failed', 'An error occurred. Please try again.');
        } finally {
            $('#loginBtn').prop('disabled', false);
            $('#loginSpinner').addClass('d-none');
        }
    }
}

// Initialize when ready
$(document).ready(() => {
    console.log('Document ready - initializing login page');
    window.loginPage = new LoginPage();
});