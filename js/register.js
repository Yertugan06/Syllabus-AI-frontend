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

        // Demo login buttons (Note: This logic is usually for the login page, but kept for context)
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
        
        $('#regPassword').on('input', () => {
            this.validatePasswordMatch(); // Also check match when password changes
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
        // This functionality is typically on the login page but redirects to login.html
        const email = $(e.target).data('email');
        const password = $(e.target).data('password');
        
        // Redirect to login page with pre-filled credentials
        window.location.href = `login.html?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    }

    async handleRegistration(e) {
        e.preventDefault();
        
        const form = e.target;
        // Run form validation for all required fields
        if (!form.checkValidity() || !this.validatePasswordMatch(true)) {
            e.stopPropagation();
            $(form).addClass('was-validated');
            return;
        }

        const firstName = $('#regFirstName').val().trim();
        const lastName = $('#regLastName').val().trim();
        const email = $('#regEmail').val().trim();
        const password = $('#regPassword').val();
        const confirmPassword = $('#regConfirmPassword').val();
        
        // The password match validation is also done in checkValidity but we keep it explicit
        if (password !== confirmPassword) {
            // Set custom validity for final check before API call (though validatePasswordMatch handles real-time)
            $('#regConfirmPassword')[0].setCustomValidity('Passwords do not match');
            $(form).addClass('was-validated');
            return;
        }
        $('#regConfirmPassword')[0].setCustomValidity(''); // Clear if it matched

        // Combine names for simplicity, assuming API needs a single 'name'
        const fullName = `${firstName} ${lastName}`;

        // Show loading state
        this.setLoadingState(true);

        try {
            const result = await AuthManager.register(email, password, fullName, firstName, lastName);
            
            if (result.success) {
                showModal('Success! 🎉', `Welcome to Syllabus AI, ${result.user.name || firstName}! Your account has been created successfully.`, 'Get Started', () => {
                    window.location.href = 'upload.html';
                });
            } else {
                // Assuming showModal is a global function defined in main.js
                showModal('Registration Failed', result.error);
            }
        } catch (error) {
            console.error("Registration API error:", error);
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
        $('#registerBtn').contents().filter(function() {
            return this.nodeType === 3; // Text nodes
        }).get(0).nodeValue = isLoading ? 'Registering...' : 'Create Account';
    }
}

// Initialize registration page
$(document).ready(() => {
    window.registerPage = new RegisterPage();
});