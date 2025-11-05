// Profile functionality
class ProfilePage {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        $(document).ready(() => {
            this.bindEvents();
            this.loadProfileData();
        });
    }

    bindEvents() {
        // Save preferences
        $('#savePreferences').click(() => {
            this.savePreferences();
        });

        // Account actions
        $('#changePassword').click(() => {
            this.changePassword();
        });

        $('#deleteAccount').click(() => {
            this.deleteAccount();
        });
    }

    loadProfileData() {
        const user = AuthManager.getCurrentUser();
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const currentUser = users.find(u => u.email === user.email);
        
        // Set user information
        $('#profileEmail').val(user.email);
        $('#userRole').val(user.role || 'User');
        
        if (currentUser) {
            const memberSince = new Date(currentUser.createdAt).toLocaleDateString();
            $('#memberSince').val(memberSince);
        }

        // Load statistics
        this.loadStatistics();
        
        // Load preferences
        this.loadPreferences();
    }

    loadStatistics() {
        const uploads = JSON.parse(localStorage.getItem('uploads') || '[]');
        const user = AuthManager.getCurrentUser();
        const userUploads = uploads.filter(upload => upload.userId === user.id);
        
        let totalTopics = 0;
        userUploads.forEach(upload => {
            totalTopics += upload.analysis?.extractedData?.topics?.length || 0;
        });

        $('#profileUploadCount').text(userUploads.length);
        $('#profileTopicCount').text(totalTopics);
        $('#profileCompletedCount').text(Math.floor(totalTopics * 0.3)); // Mock data
        $('#profileStudyHours').text(Math.floor(totalTopics * 2)); // Mock data
    }

    loadPreferences() {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        
        $('#emailNotifications').prop('checked', preferences.emailNotifications !== false);
        $('#weeklyReports').prop('checked', preferences.weeklyReports !== false);
        $('#studyReminders').prop('checked', preferences.studyReminders || false);
    }

    savePreferences() {
        const preferences = {
            emailNotifications: $('#emailNotifications').is(':checked'),
            weeklyReports: $('#weeklyReports').is(':checked'),
            studyReminders: $('#studyReminders').is(':checked'),
            savedAt: new Date().toISOString()
        };

        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        showModal('Preferences Saved', 'Your preferences have been updated successfully.');
    }

    changePassword() {
        showModal('Change Password', 'Password change functionality will be available soon.', 'OK');
    }

    deleteAccount() {
        showModal('Delete Account', 
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
            'Delete Account',
            () => {
                showModal('Account Deletion', 'Account deletion functionality will be available in a future update.', 'OK');
            }
        );
    }
}

// Initialize profile page
$(document).ready(() => {
    window.profilePage = new ProfilePage();
});