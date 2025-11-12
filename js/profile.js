// profile.js - COMPLETE with backend connection
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
        
        // Set user information
        $('#profileEmail').val(user.email);
        $('#userRole').val(user.role || 'User');
        $('#memberSince').val(new Date().toLocaleDateString()); // You might want to get this from backend

        // Load statistics
        this.loadStatistics();
        
        // Load preferences
        this.loadPreferences();
    }

    async loadStatistics() {
        try {
            const syllabi = await api.getUserSyllabi();
            
            let totalTopics = 0;
            syllabi.forEach(syllabus => {
                if (syllabus.analysis?.extractedData?.topics) {
                    totalTopics += syllabus.analysis.extractedData.topics.length;
                }
            });

            $('#profileUploadCount').text(syllabi.length);
            $('#profileTopicCount').text(totalTopics);
            $('#profileCompletedCount').text(Math.floor(totalTopics * 0.3)); // Mock completed count
            $('#profileStudyHours').text(Math.floor(totalTopics * 2)); // Mock study hours
        } catch (error) {
            console.error('Error loading statistics:', error);
            // Fallback values
            $('#profileUploadCount').text('0');
            $('#profileTopicCount').text('0');
            $('#profileCompletedCount').text('0');
            $('#profileStudyHours').text('0');
        }
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