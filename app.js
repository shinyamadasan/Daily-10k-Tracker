// 10K Steps Challenge Tracker Application
class StepsTracker {
    constructor() {
        this.participants = ['Del', 'Giem', 'Glaiz', 'Jeun', 'Joy', 'Kokoy', 'Leanne', 'Lui', 'Ramon', 'Robert', 'Sarah', 'Sheila', 'Shin', 'Yohan', 'Zephanny', 'Sam'];
        this.submissions = [];
        this.targetSteps = 10000;
        this.penaltyAmount = 50;
        this.nextId = 1;
        
        this.initializeApp();
        this.loadSampleData();
        this.bindEvents();
        this.renderAllData();
    }

    initializeApp() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('step-date').value = today;
        
        // Request notification permission
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    loadSampleData() {
  // Start with empty data - no sample entries
const sampleData = [];

if (!localStorage.getItem('stepsData')) {
    this.submissions = [];
    this.nextId = 1;
    this.saveData();
} else {
    this.loadData();
}


    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submission
        document.getElementById('steps-form').addEventListener('submit', (e) => this.handleSubmission(e));

        // File upload preview
        document.getElementById('proof-upload').addEventListener('change', (e) => this.handleFileUpload(e));

        // Filter events
        document.getElementById('search-filter').addEventListener('input', () => this.renderTracker());
        document.getElementById('date-from').addEventListener('change', () => this.renderTracker());
        document.getElementById('date-to').addEventListener('change', () => this.renderTracker());
        document.getElementById('clear-filters').addEventListener('click', () => this.clearFilters());

        // Export functionality
        document.getElementById('export-data').addEventListener('click', () => this.exportData());

        // Payment toggle events (will be bound dynamically)
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab panel
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Render data for the active tab
        if (tabName === 'tracker') {
            this.renderTracker();
        } else if (tabName === 'summary') {
            this.renderSummary();
        }
    }

    handleSubmission(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const name = document.getElementById('participant-name').value;
        const date = document.getElementById('step-date').value;
        const steps = parseInt(document.getElementById('step-count').value);
        const proofFile = document.getElementById('proof-upload').files[0];

        // Validation
        if (!name || !date || !steps) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Check for duplicate entry
        const duplicate = this.submissions.find(s => s.name === name && s.date === date);
        if (duplicate) {
            this.showMessage('Entry for this participant and date already exists.', 'error');
            return;
        }

        // Create new submission
        const submission = {
            id: this.nextId++,
            name: name,
            date: date,
            steps: steps,
            proofUrl: proofFile ? URL.createObjectURL(proofFile) : null,
            paid: false
        };

        this.submissions.push(submission);
        this.submissions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Show success message
        this.showMessage(`Steps submitted successfully for ${name}!`, 'success');

        // Clear form
        form.reset();
        document.getElementById('step-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('image-preview').classList.add('hidden');

        // Update all displays
        this.renderAllData();
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('image-preview');

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Proof preview">`;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('hidden');
        }
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('submit-message');
        messageEl.textContent = text;
        messageEl.className = `submit-message ${type}`;
        messageEl.classList.remove('hidden');

        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
    }

    renderAllData() {
        this.renderTracker();
        this.renderSummary();
    }

    renderTracker() {
        const tbody = document.getElementById('submissions-tbody');
        const searchTerm = document.getElementById('search-filter').value.toLowerCase();
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;

        // Filter submissions
        let filtered = this.submissions.filter(submission => {
            const matchesSearch = !searchTerm || submission.name.toLowerCase().includes(searchTerm);
            const matchesDateFrom = !dateFrom || submission.date >= dateFrom;
            const matchesDateTo = !dateTo || submission.date <= dateTo;
            return matchesSearch && matchesDateFrom && matchesDateTo;
        });

        // Render table rows
        tbody.innerHTML = filtered.map(submission => {
            const status = submission.steps >= this.targetSteps ? 'OK' : 'Missed';
            const statusClass = submission.steps >= this.targetSteps ? 'status-ok' : 'status-missed';
            const amountOwed = submission.steps >= this.targetSteps ? 0 : this.penaltyAmount;
            const amountClass = amountOwed === 0 ? 'amount-zero' : '';

            return `
                <tr>
                  // Edit submission function
editSubmission(id) {
    const submission = this.submissions.find(s => s.id === id);
    if (!submission) return;
    
    const newSteps = prompt(`Edit steps for ${submission.name} on ${submission.date}:`, submission.steps);
    if (newSteps === null) return; // User cancelled
    
    const steps = parseInt(newSteps);
    if (isNaN(steps) || steps < 0) {
        alert('Please enter a valid number of steps');
        return;
    }
    
    submission.steps = steps;
    this.saveData();
    this.renderAllData();
    alert(`✅ Updated ${submission.name}'s steps to ${steps.toLocaleString()}`);
}

// Delete submission function  
deleteSubmission(id) {
    const submission = this.submissions.find(s => s.id === id);
    if (!submission) return;
    
    if (confirm(`Delete ${submission.name}'s entry for ${submission.date}?\n\nSteps: ${submission.steps.toLocaleString()}\n\nThis cannot be undone!`)) {
        this.submissions = this.submissions.filter(s => s.id !== id);
        this.saveData();
        this.renderAllData();
        alert('✅ Entry deleted successfully');
    }
}

// Global functions for onclick handlers
window.editSubmission = (id) => window.stepsTracker.editSubmission(id);
window.deleteSubmission = (id) => window.stepsTracker.deleteSubmission(id);

                </tr>
            `;
        }).join('');

        // Update summary stats
        this.updateTrackerSummary(filtered);
    }

    updateTrackerSummary(submissions) {
        const totalEntries = submissions.length;
        const missedDays = submissions.filter(s => s.steps < this.targetSteps).length;
        const totalOwed = missedDays * this.penaltyAmount;

        document.getElementById('total-entries').textContent = totalEntries;
        document.getElementById('total-missed').textContent = missedDays;
        document.getElementById('total-owed').textContent = totalOwed;
    }

    renderSummary() {
        const container = document.getElementById('participant-summaries');
        const summaries = this.calculateParticipantSummaries();

        container.innerHTML = summaries.map(summary => {
            const completionRate = summary.totalSubmissions > 0 
                ? ((summary.totalSubmissions - summary.daysMissed) / summary.totalSubmissions * 100)
                : 0;

            return `
                <div class="participant-card">
                    <div class="participant-header">
                        <h3 class="participant-name">${summary.name}</h3>
                        <button class="payment-toggle ${summary.paid ? 'paid' : ''}" 
                                data-participant="${summary.name}">
                            ${summary.paid ? 'Paid' : 'Mark as Paid'}
                        </button>
                    </div>
                    
                    <div class="participant-stats">
                        <div class="stat-box">
                            <span class="stat-value">${summary.totalSubmissions}</span>
                            <div class="stat-label">Total Submissions</div>
                        </div>
                        <div class="stat-box">
                            <span class="stat-value">${summary.daysMissed}</span>
                            <div class="stat-label">Days Missed</div>
                        </div>
                        <div class="stat-box">
                            <span class="stat-value">₱${summary.totalOwed}</span>
                            <div class="stat-label">Amount Owed</div>
                        </div>
                        <div class="stat-box">
                            <span class="stat-value">${Math.round(completionRate)}%</span>
                            <div class="stat-label">Completion Rate</div>
                        </div>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionRate}%"></div>
                    </div>
                    <div class="completion-text">${Math.round(completionRate)}% completion rate</div>
                </div>
            `;
        }).join('');

        // Bind payment toggle events
        document.querySelectorAll('.payment-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePayment(e.target.dataset.participant));
        });

        // Update grand total
        const grandTotal = summaries.reduce((total, s) => total + (s.paid ? 0 : s.totalOwed), 0);
        document.getElementById('grand-total-amount').textContent = grandTotal;
    }

    calculateParticipantSummaries() {
        return this.participants.map(name => {
            const participantSubmissions = this.submissions.filter(s => s.name === name);
            const daysMissed = participantSubmissions.filter(s => s.steps < this.targetSteps).length;
            const totalOwed = daysMissed * this.penaltyAmount;
            const paid = participantSubmissions.length > 0 && participantSubmissions.every(s => s.paid);

            return {
                name,
                totalSubmissions: participantSubmissions.length,
                daysMissed,
                totalOwed,
                paid
            };
        });
    }

    togglePayment(participantName) {
        // Toggle paid status for all submissions of this participant
        this.submissions.forEach(submission => {
            if (submission.name === participantName) {
                submission.paid = !submission.paid;
            }
        });

        // Re-render summary
        this.renderSummary();
    }

    clearFilters() {
        document.getElementById('search-filter').value = '';
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';
        this.renderTracker();
    }

    exportData() {
        const summaries = this.calculateParticipantSummaries();
        const grandTotal = summaries.reduce((total, s) => total + (s.paid ? 0 : s.totalOwed), 0);

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "10K Steps Challenge - Payment Summary\n\n";
        csvContent += "Name,Total Submissions,Days Missed,Amount Owed,Payment Status\n";
        
        summaries.forEach(s => {
            csvContent += `${s.name},${s.totalSubmissions},${s.daysMissed},₱${s.totalOwed},${s.paid ? 'Paid' : 'Pending'}\n`;
        });

        csvContent += `\nGrand Total,,,₱${grandTotal},\n\n`;
        csvContent += "Detailed Submissions\n";
        csvContent += "Date,Name,Steps,Status,Amount Owed\n";

        this.submissions.forEach(s => {
            const status = s.steps >= this.targetSteps ? 'OK' : 'Missed';
            const amount = s.steps >= this.targetSteps ? 0 : this.penaltyAmount;
            csvContent += `${s.date},${s.name},${s.steps},${status},₱${amount}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `steps-challenge-summary-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Simulate daily reminder (for demo purposes)
    showDailyReminder() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('10K Steps Challenge Reminder', {
                body: 'Don\'t forget to log your steps for today!',
                icon: '/favicon.ico'
            });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new StepsTracker();
    
    // Set up daily reminder (demo - would typically be a service worker)
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 20 && now.getMinutes() === 0) { // 8 PM reminder
            tracker.showDailyReminder();
        }
    }, 60000); // Check every minute
});
