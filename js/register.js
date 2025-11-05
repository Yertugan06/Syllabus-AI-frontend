// Registration functionality
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

        // Demo login buttons
        $('.demo-login').click((e) => {
            this.fillDemoCredentials(e);
        });

        // Registration form submission
        $('#registerForm').submit((e) => {
            this.handleRegistration(e);
        });

        // Real-time password validation
        $('#regConfirmPassword').on('input', () => {
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

    fillDemoCredentials(e) {
        const email = $(e.target).data('email');
        const password = $(e.target).data('password');
        
        $('#loginEmail').val(email);
        $('#loginPassword').val(password);
        
        // Redirect to login page with pre-filled credentials
        window.location.href = `login.html?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    }

    async handleRegistration(e) {
        e.preventDefault();
        
        const form = e.target;
        if (!form.checkValidity()) {
            e.stopPropagation();
            $(form).addClass('was-validated');
            return;
        }

        const email = $('#regEmail').val();
        const password = $('#regPassword').val();
        const confirmPassword = $('#regConfirmPassword').val();

        // Validate password match
        if (password !== confirmPassword) {
            $('#regConfirmPassword')[0].setCustomValidity('Passwords do not match');
            $(form).addClass('was-validated');
            return;
        }
        $('#regConfirmPassword')[0].setCustomValidity('');

        // Show loading state
        this.setLoadingState(true);

        try {
            const result = await AuthManager.register(email, password);
            
            if (result.success) {
                showModal('Success!', `Welcome to Syllabus AI, ${result.user.name}! Your account has been created successfully.`, 'Get Started', () => {
                    window.location.href = 'upload.html';
                });
            } else {
                showModal('Registration Failed', result.error);
            }
        } catch (error) {
            showModal('Registration Failed', 'An error occurred during registration. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validatePasswordMatch() {
        const password = $('#regPassword').val();
        const confirmPassword = $('#regConfirmPassword').val();
        
        if (confirmPassword && password !== confirmPassword) {
            $('#regConfirmPassword').addClass('is-invalid');
        } else {
            $('#regConfirmPassword').removeClass('is-invalid');
        }
    }

    setLoadingState(isLoading) {
        $('#registerBtn').prop('disabled', isLoading);
        $('#registerSpinner').toggleClass('d-none', !isLoading);
    }
}

// Initialize registration page
$(document).ready(() => {
    window.registerPage = new RegisterPage();
});