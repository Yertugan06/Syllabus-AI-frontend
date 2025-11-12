// register.js - COMPLETE with backend connection
class RegisterPage {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        $(document).ready(() => {
            this.bindEvents();
        });
    }

    bindEvents() {
        // Toggle password visibility
        $('.toggle-password').click((e) => {
            this.togglePasswordVisibility(e);
        });

        // Demo login buttons - redirect to login page with credentials
        $('.demo-login').click((e) => {
            const email = $(e.target).data('email');
            const password = $(e.target).data('password');
            window.location.href = `login.html?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        });

        // Registration form submission
        $('#registerForm').submit((e) => {
            this.handleRegistration(e);
        });

        // Real-time password validation
        $('#regConfirmPassword').on('input', () => {
            this.validatePasswordMatch();
        });
        
        $('#regPassword').on('input', () => {
            this.validatePasswordMatch();
        });
    }

    togglePasswordVisibility(e) {
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
    }

    async handleRegistration(e) {
        e.preventDefault();
        
        const form = e.target;
        if (!form.checkValidity() || !this.validatePasswordMatch(true)) {
            e.stopPropagation();
            $(form).addClass('was-validated');
            return;
        }

        const userData = {
            firstName: $('#regFirstName').val().trim(),
            lastName: $('#regLastName').val().trim(),
            email: $('#regEmail').val().trim(),
            password: $('#regPassword').val(),
            role: 'STUDENT' // Default role for new registrations
        };

        this.setLoadingState(true);

        try {
            const result = await AuthManager.register(userData);
            
            if (result.success) {
                showModal('Success! 🎉', `Welcome to Syllabus AI, ${result.user.firstName}! Your account has been created successfully.`, 'Get Started', () => {
                    window.location.href = 'dashboard.html';
                });
            } else {
                showModal('Registration Failed', result.error);
            }
        } catch (error) {
            console.error("Registration error:", error);
            showModal('Registration Failed', 'An error occurred during registration. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validatePasswordMatch(isFormSubmission = false) {
        const password = $('#regPassword').val();
        const confirmPassword = $('#regConfirmPassword').val();
        const confirmPasswordInput = $('#regConfirmPassword')[0];
        
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.setCustomValidity('Passwords must match.');
            if (isFormSubmission) {
                 $('#regConfirmPassword').addClass('is-invalid');
            }
            return false;
        } else {
            confirmPasswordInput.setCustomValidity('');
            $('#regConfirmPassword').removeClass('is-invalid');
            return true;
        }
    }

    setLoadingState(isLoading) {
        $('#registerBtn').prop('disabled', isLoading);
        $('#registerSpinner').toggleClass('d-none', !isLoading);
        $('#registerBtn').text(isLoading ? 'Registering...' : 'Create Account');
    }
}

// Initialize registration page
$(document).ready(() => {
    window.registerPage = new RegisterPage();
});