// ===== GLOBAL STATE =====
let currentSection = 'landingPage';
let applicationData = {};
let candidates = [];
let chatQuestions = [];
let currentQuestionIndex = 0;
let candidateAnswers = {};

// ===== SUPABASE INIT =====
const supabaseUrl = 'https://jbkhcyhkognalbhsqlxg.supabase.co';
const supabaseKey = 'sb_publishable_f027DYFYjTft4aWsbsoZKQ_tE1Ik4Mu';
let supabaseClient = null;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    createParticles();
    loadCandidatesFromStorage();
});

function initializeApp() {
    // Check Auth State
    if (supabaseClient) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            updateAuthUI(session);
        });

        supabaseClient.auth.onAuthStateChange((_event, session) => {
            updateAuthUI(session);
        });
    }

    // Show loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        showSection('landingPage');
    }, 2000);
}

// ===== SECTION NAVIGATION =====
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        window.scrollTo(0, 0);
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Application form
    const applicationForm = document.getElementById('jobApplicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleApplicationSubmit);
    }

    // File upload
    const fileUploadArea = document.getElementById('fileUploadArea');
    const resumeFile = document.getElementById('resumeFile');
    
    if (fileUploadArea && resumeFile) {
        fileUploadArea.addEventListener('click', () => resumeFile.click());
        
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = 'var(--primary)';
        });
        
        fileUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = 'var(--border)';
        });
        
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.style.borderColor = 'var(--border)';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
        
        resumeFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    // Chat input
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    
    if (chatInput && sendBtn) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !chatInput.disabled) {
                sendChatMessage();
            }
        });
        
        sendBtn.addEventListener('click', sendChatMessage);
    }

    // Recruiter dashboard filters
    const searchInput = document.getElementById('candidateSearch');
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterCandidates);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterCandidates);
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', filterCandidates);
    }

    // Candidate login (Google Auth via Supabase)
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn && supabaseClient) {
        googleLoginBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
        });
    }

    // Email Login
    const emailLoginForm = document.getElementById('emailLoginForm');
    if (emailLoginForm && supabaseClient) {
        emailLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorEl = document.getElementById('loginError');
            
            const btn = document.getElementById('emailLoginBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            btn.disabled = true;

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            btn.innerHTML = originalText;
            btn.disabled = false;

            if (error) {
                errorEl.textContent = error.message;
                errorEl.style.display = 'block';
            } else {
                errorEl.style.display = 'none';
                emailLoginForm.reset();
            }
        });
    }

    // Email Signup
    const emailSignupForm = document.getElementById('emailSignupForm');
    if (emailSignupForm && supabaseClient) {
        emailSignupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const errorEl = document.getElementById('signupError');
            
            const btn = document.getElementById('emailSignupBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing up...';
            btn.disabled = true;

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            btn.innerHTML = originalText;
            btn.disabled = false;

            if (error) {
                errorEl.textContent = error.message;
                errorEl.style.display = 'block';
            } else {
                errorEl.style.display = 'none';
                alert('Signup successful! You can now log in.');
                switchAuthTab('login');
                emailSignupForm.reset();
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && supabaseClient) {
        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
        });
    }
}

// ===== AUTH UI HELPER =====
window.switchAuthTab = function(tab) {
    const loginForm = document.getElementById('emailLoginForm');
    const signupForm = document.getElementById('emailSignupForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabLogin.style.color = 'var(--primary)';
        tabLogin.style.borderBottom = '2px solid var(--primary)';
        tabSignup.classList.remove('active');
        tabSignup.style.color = 'var(--text-secondary)';
        tabSignup.style.borderBottom = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        tabSignup.classList.add('active');
        tabSignup.style.color = 'var(--primary)';
        tabSignup.style.borderBottom = '2px solid var(--primary)';
        tabLogin.classList.remove('active');
        tabLogin.style.color = 'var(--text-secondary)';
        tabLogin.style.borderBottom = 'none';
    }
}

// ===== AUTH UI =====
function updateAuthUI(session) {
    const loggedOutView = document.getElementById('loggedOutView');
    const loggedInView = document.getElementById('loggedInView');
    const navProfileContent = document.getElementById('navProfileContent');
    
    if (session) {
        const user = session.user;
        const name = user.user_metadata?.full_name || user.email.split('@')[0];
        const avatarUrl = user.user_metadata?.avatar_url;
        
        // Update Navbar Profile
        if (navProfileContent) {
            let navAvatarHtml = '';
            if (avatarUrl) {
                navAvatarHtml = `<img src="${avatarUrl}" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--primary);">`;
            } else {
                const initial = name.charAt(0).toUpperCase();
                navAvatarHtml = `<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid var(--primary);">${initial}</div>`;
            }
            navProfileContent.innerHTML = `
                ${navAvatarHtml}
                <span style="color: var(--text-primary); font-weight: 500;">${name}</span>
            `;
        }

        if (loggedOutView) loggedOutView.style.display = 'none';
        if (loggedInView) {
            loggedInView.style.display = 'block';
            document.getElementById('userName').textContent = name;
            document.getElementById('userEmail').textContent = user.email;
            
            const userAvatar = document.getElementById('userAvatar');
            const userInitialsAvatar = document.getElementById('userInitialsAvatar');
            
            if (avatarUrl) {
                userAvatar.src = avatarUrl;
                userAvatar.style.display = 'block';
                userInitialsAvatar.style.display = 'none';
            } else {
                userAvatar.style.display = 'none';
                userInitialsAvatar.textContent = name.charAt(0).toUpperCase();
                userInitialsAvatar.style.display = 'flex';
            }
        }
    } else {
        // Logged Out Navbar Profile
        if (navProfileContent) {
            navProfileContent.innerHTML = `<a href="#" style="color: var(--primary); font-weight: 600;">Login</a>`;
        }

        if (loggedOutView) loggedOutView.style.display = 'block';
        if (loggedInView) loggedInView.style.display = 'none';
    }
}

// ===== FILE HANDLING =====
function handleFileSelect(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF or DOC file');
        return;
    }
    
    if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
    }
    
    const uploadedFileName = document.getElementById('uploadedFileName');
    uploadedFileName.innerHTML = `
        <i class="fas fa-file-pdf"></i>
        <strong>${file.name}</strong>
        <span>(${(file.size / 1024).toFixed(2)} KB)</span>
    `;
    uploadedFileName.classList.add('show');
    
    applicationData.resumeFile = file.name;
}

// ===== APPLICATION FORM =====
function handleApplicationSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    applicationData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        skills: document.getElementById('skills').value,
        experience: document.getElementById('experience').value,
        resumeFile: applicationData.resumeFile || 'resume.pdf',
        applicationId: generateApplicationId(),
        appliedDate: new Date().toISOString(),
        status: 'Applied'
    };
    
    // Show resume analysis
    showSection('resumeAnalysis');
    startResumeAnalysis();
}

function generateApplicationId() {
    return 'APP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// ===== RESUME ANALYSIS =====
function startResumeAnalysis() {
    const progressItems = document.querySelectorAll('.progress-item .progress-fill');
    const extractedData = document.getElementById('extractedData');
    
    // Animate progress bars
    progressItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.width = '100%';
        }, (index + 1) * 800);
    });
    
    // Show extracted data after analysis
    setTimeout(() => {
        displayExtractedData();
        extractedData.style.display = 'block';
    }, 4000);
}

function displayExtractedData() {
    // Extract skills
    const skills = applicationData.skills.split(',').map(s => s.trim()).filter(s => s);
    const extractedSkills = document.getElementById('extractedSkills');
    extractedSkills.innerHTML = skills.map(skill => 
        `<span class="skill-tag">${skill}</span>`
    ).join('');
    
    // Simulated education data
    const educationData = [
        'Bachelor of Science in Computer Science',
        'University of Technology, 2018-2022',
        'GPA: 3.8/4.0'
    ];
    document.getElementById('extractedEducation').innerHTML = educationData.map(item => 
        `<p style="margin-bottom: 8px; color: var(--text-secondary);">${item}</p>`
    ).join('');
    
    // Simulated experience
    const experienceData = [
        `${applicationData.experience || '2-3'} years of professional experience`,
        'Software Development & Project Management',
        'Proven track record in team collaboration'
    ];
    document.getElementById('extractedExperience').innerHTML = experienceData.map(item => 
        `<p style="margin-bottom: 8px; color: var(--text-secondary);">${item}</p>`
    ).join('');
    
    // Simulated certifications
    const certifications = [
        'Certified Professional Developer',
        'Agile Scrum Master',
        'Cloud Architecture Certification'
    ];
    document.getElementById('extractedCertifications').innerHTML = certifications.map(cert => 
        `<p style="margin-bottom: 8px; color: var(--text-secondary);"><i class="fas fa-certificate" style="color: var(--accent); margin-right: 8px;"></i>${cert}</p>`
    ).join('');
}

// ===== AI RECRUITER CHAT =====
function initializeChat() {
    chatQuestions = [
        {
            question: "What are your primary career goals for the next 2-3 years?",
            type: "text"
        },
        {
            question: "Which of these best describes your current career level?",
            type: "choice",
            options: ["Entry Level", "Mid-Level", "Senior", "Lead/Manager"]
        },
        {
            question: "What type of role are you most interested in?",
            type: "choice",
            options: ["Technical Individual Contributor", "Team Lead", "Manager", "Consultant", "Freelance"]
        },
        {
            question: "What is your expected salary range? (in USD per year)",
            type: "text"
        },
        {
            question: "When are you available to start?",
            type: "choice",
            options: ["Immediately", "2 weeks notice", "1 month", "2+ months"]
        },
        {
            question: "Are you open to remote work opportunities?",
            type: "choice",
            options: ["Yes, remote only", "Yes, hybrid preferred", "No, office only", "Flexible"]
        }
    ];
    
    currentQuestionIndex = 0;
    candidateAnswers = {};
    
    setTimeout(() => {
        askNextQuestion();
    }, 1000);
}

function askNextQuestion() {
    if (currentQuestionIndex >= chatQuestions.length) {
        finishInterview();
        return;
    }
    
    const question = chatQuestions[currentQuestionIndex];
    
    // Show typing indicator
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        addAIMessage(question.question);
        
        if (question.type === 'choice') {
            showQuickResponses(question.options);
            document.getElementById('chatInput').disabled = true;
            document.getElementById('sendMessageBtn').disabled = true;
        } else {
            document.getElementById('chatInput').disabled = false;
            document.getElementById('sendMessageBtn').disabled = false;
            document.getElementById('chatInput').focus();
        }
    }, 1500);
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator-msg';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.querySelector('.typing-indicator-msg');
    if (typing) {
        typing.remove();
    }
}

function addAIMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addUserMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showQuickResponses(options) {
    const quickResponses = document.getElementById('quickResponses');
    quickResponses.innerHTML = options.map(option => 
        `<button class="quick-response-btn" onclick="selectQuickResponse('${option}')">${option}</button>`
    ).join('');
}

function selectQuickResponse(response) {
    addUserMessage(response);
    candidateAnswers[`question_${currentQuestionIndex}`] = response;
    document.getElementById('quickResponses').innerHTML = '';
    currentQuestionIndex++;
    
    setTimeout(() => {
        askNextQuestion();
    }, 800);
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    candidateAnswers[`question_${currentQuestionIndex}`] = message;
    chatInput.value = '';
    
    currentQuestionIndex++;
    
    setTimeout(() => {
        askNextQuestion();
    }, 800);
}

function finishInterview() {
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        addAIMessage("Thank you for answering all my questions! I've gathered all the information I need. Let me now analyze your profile and generate your compatibility score...");
        
        document.getElementById('chatInput').disabled = true;
        document.getElementById('sendMessageBtn').disabled = true;
        
        setTimeout(() => {
            showSection('profileDashboard');
            generateProfileScores();
        }, 3000);
    }, 1500);
}

// ===== PROFILE DASHBOARD =====
function generateProfileScores() {
    // Generate random but realistic scores
    const scores = {
        skillMatch: Math.floor(Math.random() * 20) + 75, // 75-95
        roleCompatibility: Math.floor(Math.random() * 20) + 70, // 70-90
        resumeQuality: Math.floor(Math.random() * 15) + 80, // 80-95
        atsOptimization: Math.floor(Math.random() * 25) + 70 // 70-95
    };
    
    // Store overall score
    applicationData.overallScore = Math.floor((scores.skillMatch + scores.roleCompatibility + scores.resumeQuality + scores.atsOptimization) / 4);
    
    // Animate circular progress
    setTimeout(() => {
        animateCircularProgress(0, scores.skillMatch);
    }, 300);
    
    setTimeout(() => {
        animateCircularProgress(1, scores.roleCompatibility);
    }, 600);
    
    setTimeout(() => {
        animateCircularProgress(2, scores.resumeQuality);
    }, 900);
    
    setTimeout(() => {
        animateCircularProgress(3, scores.atsOptimization);
    }, 1200);
    
    // Display detailed analysis
    setTimeout(() => {
        displayDetailedAnalysis(scores);
    }, 2000);
}

function animateCircularProgress(index, score) {
    const progressCards = document.querySelectorAll('.circular-progress');
    const card = progressCards[index];
    const circle = card.querySelector('.progress-circle');
    const scoreText = card.querySelector('.score-text');
    
    const circumference = 314;
    const offset = circumference - (score / 100) * circumference;
    
    circle.style.strokeDashoffset = offset;
    
    // Animate number
    let current = 0;
    const interval = setInterval(() => {
        current += 2;
        if (current >= score) {
            current = score;
            clearInterval(interval);
        }
        scoreText.textContent = current + '%';
    }, 30);
}

function displayDetailedAnalysis(scores) {
    // Strengths
    const strengths = [
        "Strong technical skill set matching job requirements",
        "Excellent educational background and certifications",
        "Clear career progression and growth mindset",
        "Effective communication in interview responses",
        "Professional profile presentation"
    ];
    
    const strengthsList = document.getElementById('strengthsList');
    strengthsList.innerHTML = strengths.map(item => `
        <div class="analysis-item">
            <i class="fas fa-check-circle"></i>
            <span>${item}</span>
        </div>
    `).join('');
    
    // Improvements
    const improvements = [
        "Consider adding more specific project outcomes to resume",
        "Include measurable achievements and metrics",
        "Expand on leadership experience if applicable"
    ];
    
    const improvementsList = document.getElementById('improvementsList');
    improvementsList.innerHTML = improvements.map(item => `
        <div class="analysis-item">
            <i class="fas fa-exclamation-circle"></i>
            <span>${item}</span>
        </div>
    `).join('');
    
    // Recommendations
    const recommendations = [
        "Your profile shows strong potential for senior roles",
        "Consider roles that leverage both technical and leadership skills",
        "Update LinkedIn profile to match resume format",
        "Prepare case studies of your key projects for interviews"
    ];
    
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = recommendations.map(item => `
        <div class="analysis-item">
            <i class="fas fa-lightbulb"></i>
            <span>${item}</span>
        </div>
    `).join('');
}

// ===== SUBMIT TO RECRUITER =====
function submitToRecruiter() {
    // Add to candidates list
    applicationData.answers = candidateAnswers;
    candidates.push(applicationData);
    saveCandidatesToStorage();
    
    // Show success modal
    document.getElementById('generatedAppId').textContent = applicationData.applicationId;
    document.getElementById('successModal').classList.add('show');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
    showSection('landingPage');
    
    // Reset form
    document.getElementById('jobApplicationForm').reset();
    document.getElementById('uploadedFileName').classList.remove('show');
    applicationData = {};
}

// ===== RECRUITER DASHBOARD =====
function generateSampleCandidates() {
    const sampleNames = [
        "Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", 
        "Jessica Williams", "Robert Taylor", "Amanda Martinez", "James Anderson",
        "Lisa Thompson", "Christopher Lee"
    ];
    
    const sampleSkills = [
        ["JavaScript", "React", "Node.js", "MongoDB"],
        ["Python", "Django", "PostgreSQL", "AWS"],
        ["Java", "Spring Boot", "Microservices", "Docker"],
        ["TypeScript", "Angular", "GraphQL", "Azure"],
        ["C#", ".NET", "SQL Server", "Kubernetes"],
        ["PHP", "Laravel", "MySQL", "Vue.js"],
        ["Ruby", "Rails", "Redis", "Heroku"],
        ["Go", "Gin", "PostgreSQL", "GCP"],
        ["Swift", "iOS", "Firebase", "SwiftUI"],
        ["Kotlin", "Android", "Room", "Jetpack"]
    ];
    
    const statuses = ["Applied", "Shortlisted", "Interview Ready", "Selected"];
    const locations = ["New York, USA", "San Francisco, USA", "London, UK", "Toronto, Canada", "Berlin, Germany", "Singapore", "Sydney, Australia"];
    
    candidates = [];
    
    for (let i = 0; i < 10; i++) {
        const skills = sampleSkills[i];
        const score = Math.floor(Math.random() * 25) + 70;
        
        candidates.push({
            fullName: sampleNames[i],
            email: sampleNames[i].toLowerCase().replace(' ', '.') + '@email.com',
            phone: '+1 (555) ' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 9000 + 1000),
            location: locations[Math.floor(Math.random() * locations.length)],
            skills: skills.join(', '),
            experience: ['0-1', '1-3', '3-5', '5-8', '8+'][Math.floor(Math.random() * 5)],
            applicationId: 'APP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
            appliedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            overallScore: score
        });
    }
    
    saveCandidatesToStorage();
    displayCandidates(candidates);
    updateDashboardStats();
}

function displayCandidates(candidatesToDisplay) {
    const candidatesList = document.getElementById('candidatesList');
    
    if (candidatesToDisplay.length === 0) {
        candidatesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No candidates found</h3>
                <p>Try adjusting your filters or generate sample data</p>
            </div>
        `;
        return;
    }
    
    candidatesList.innerHTML = candidatesToDisplay.map(candidate => {
        const initials = candidate.fullName.split(' ').map(n => n[0]).join('');
        const skillsList = candidate.skills.split(',').slice(0, 4);
        
        return `
            <div class="candidate-card" onclick="showCandidateDetail('${candidate.applicationId}')">
                <div class="candidate-avatar">${initials}</div>
                <div class="candidate-info">
                    <div class="candidate-name">${candidate.fullName}</div>
                    <div class="candidate-details">
                        <span><i class="fas fa-envelope"></i> ${candidate.email}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${candidate.location}</span>
                        <span><i class="fas fa-briefcase"></i> ${candidate.experience} years</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(candidate.appliedDate).toLocaleDateString()}</span>
                    </div>
                    <div class="candidate-skills">
                        ${skillsList.map(skill => `<span class="skill-badge">${skill.trim()}</span>`).join('')}
                    </div>
                </div>
                <div class="candidate-score">
                    <div class="score-value">${candidate.overallScore}</div>
                    <div class="score-label">Match Score</div>
                </div>
                <div>
                    <span class="candidate-status status-${candidate.status.toLowerCase().replace(' ', '-')}">${candidate.status}</span>
                </div>
            </div>
        `;
    }).join('');
}

function filterCandidates() {
    const searchTerm = document.getElementById('candidateSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filtered = candidates.filter(candidate => {
        const matchesSearch = 
            candidate.fullName.toLowerCase().includes(searchTerm) ||
            candidate.email.toLowerCase().includes(searchTerm) ||
            candidate.skills.toLowerCase().includes(searchTerm) ||
            candidate.location.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    // Sort
    if (sortBy === 'score') {
        filtered.sort((a, b) => b.overallScore - a.overallScore);
    } else if (sortBy === 'date') {
        filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
    
    displayCandidates(filtered);
}

function updateDashboardStats() {
    document.getElementById('totalCandidates').textContent = candidates.length;
    document.getElementById('shortlistedCount').textContent = candidates.filter(c => c.status === 'Shortlisted').length;
    document.getElementById('interviewReadyCount').textContent = candidates.filter(c => c.status === 'Interview Ready').length;
    document.getElementById('selectedCount').textContent = candidates.filter(c => c.status === 'Selected').length;
}

function showCandidateDetail(applicationId) {
    const candidate = candidates.find(c => c.applicationId === applicationId);
    if (!candidate) return;
    
    const modal = document.getElementById('candidateModal');
    const modalBody = document.getElementById('modalBody');
    
    const skillsList = candidate.skills.split(',');
    
    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="candidate-avatar" style="width: 100px; height: 100px; font-size: 40px; margin: 0 auto 20px;">
                ${candidate.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 style="margin-bottom: 10px;">${candidate.fullName}</h2>
            <span class="candidate-status status-${candidate.status.toLowerCase().replace(' ', '-')}">${candidate.status}</span>
        </div>
        
        <div style="display: grid; gap: 20px; margin-bottom: 30px;">
            <div class="data-card">
                <h4><i class="fas fa-user"></i> Contact Information</h4>
                <p style="color: var(--text-secondary); margin-top: 10px;">
                    <strong>Email:</strong> ${candidate.email}<br>
                    <strong>Phone:</strong> ${candidate.phone}<br>
                    <strong>Location:</strong> ${candidate.location}
                </p>
            </div>
            
            <div class="data-card">
                <h4><i class="fas fa-briefcase"></i> Experience & Application</h4>
                <p style="color: var(--text-secondary); margin-top: 10px;">
                    <strong>Experience:</strong> ${candidate.experience} years<br>
                    <strong>Application ID:</strong> ${candidate.applicationId}<br>
                    <strong>Applied:</strong> ${new Date(candidate.appliedDate).toLocaleDateString()}
                </p>
            </div>
            
            <div class="data-card">
                <h4><i class="fas fa-cogs"></i> Skills</h4>
                <div class="skill-tags" style="margin-top: 15px;">
                    ${skillsList.map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                </div>
            </div>
            
            <div class="data-card">
                <h4><i class="fas fa-chart-line"></i> Compatibility Score</h4>
                <div style="text-align: center; margin-top: 20px;">
                    <div style="font-size: 64px; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        ${candidate.overallScore}%
                    </div>
                    <p style="color: var(--text-secondary);">Overall Match Score</p>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button class="btn btn-primary" onclick="updateCandidateStatus('${applicationId}', 'Shortlisted')">
                <i class="fas fa-star"></i> Shortlist
            </button>
            <button class="btn btn-accent" onclick="updateCandidateStatus('${applicationId}', 'Interview Ready')">
                <i class="fas fa-comments"></i> Schedule Interview
            </button>
            <button class="btn btn-secondary" onclick="closeModal()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;
    
    modal.classList.add('show');
}

function updateCandidateStatus(applicationId, newStatus) {
    const candidate = candidates.find(c => c.applicationId === applicationId);
    if (candidate) {
        candidate.status = newStatus;
        saveCandidatesToStorage();
        displayCandidates(candidates);
        updateDashboardStats();
        closeModal();
        
        // Show success message
        alert(`Candidate status updated to: ${newStatus}`);
    }
}

function closeModal() {
    document.getElementById('candidateModal').classList.remove('show');
}

// ===== LOCAL STORAGE =====
function saveCandidatesToStorage() {
    localStorage.setItem('ats_candidates', JSON.stringify(candidates));
}

function loadCandidatesFromStorage() {
    const stored = localStorage.getItem('ats_candidates');
    if (stored) {
        candidates = JSON.parse(stored);
        if (currentSection === 'recruiterDashboard') {
            displayCandidates(candidates);
            updateDashboardStats();
        }
    }
}

// ===== PARTICLES ANIMATION =====
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(0, 217, 255, 0.5)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        particlesContainer.appendChild(particle);
    }
}

// ===== INITIALIZE CHAT WHEN SECTION IS SHOWN =====
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'aiRecruiter' && mutation.target.classList.contains('active')) {
            const messagesContainer = document.getElementById('chatMessages');
            // Only initialize if it's the first time
            if (messagesContainer.children.length === 1) {
                initializeChat();
            }
        }
    });
});

const aiRecruiterSection = document.getElementById('aiRecruiter');
if (aiRecruiterSection) {
    observer.observe(aiRecruiterSection, { attributes: true, attributeFilter: ['class'] });
}

// ===== INITIALIZE RECRUITER DASHBOARD =====
const recruiterObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.id === 'recruiterDashboard' && mutation.target.classList.contains('active')) {
            if (candidates.length > 0) {
                displayCandidates(candidates);
                updateDashboardStats();
            }
        }
    });
});

const recruiterDashboardSection = document.getElementById('recruiterDashboard');
if (recruiterDashboardSection) {
    recruiterObserver.observe(recruiterDashboardSection, { attributes: true, attributeFilter: ['class'] });
}
