# 🧠 AI-Powered Recruitment Platform

An AI-powered recruitment platform designed to streamline candidate assessments through **Multiple Choice Questions (MCQs)**.  
The platform allows **Admins (Evaluators/Recruiters)** to create assessments tailored to both aptitude and technical skills required for specific roles.  
Admins can either select from a pre-existing question bank or generate new ones with AI assistance.  

Built with **Supabase** for authentication, storage, and data management.  

---

## 👥 User Roles

### 1. Admin (Evaluator/Recruiter)
- **Authentication**: Secure login with Supabase Authentication (email/password).  
- **Assessment Creation**:  
  - Configure total assessment time and time per question.  
  - Select from a question bank or generate new AI-powered questions.  
  - Define correct/incorrect answer options for automatic grading.  
- **MCQ Evaluation**: Automatic grading with detailed evaluation reports.  
- **Assessment Link Generation**: Create unique, 48-hour valid links for candidates.  
- **View Results**: See candidate scores, feedback, and performance breakdowns.  

### 2. Candidate
- **Access**: Receives a unique 48-hour valid link via email.  
- **Interface**: One question at a time, with a countdown timer.  
- **Completion**: Assessment cannot be paused or restarted once begun.  
- **Feedback**: Automatic score and performance summary after completion.  

---

## 🔗 Assessment Link Logic
- **Unique Link**: Each assessment link is a unique `UUID`.  
- **Link Expiry**: Expires 48 hours after generation.  
- **Access Control**: Expired links show an "Expired" message.  

---

## ⏱ Timing Configuration
- **Admin Inputs**:  
  - Total Assessment Time (e.g., 30 min).  
  - Time per Question (e.g., 2 min).  
- **Dynamic Timer**: Countdown timer per question + total duration.  
  - Auto-move to next question once time expires.  

---

## 🧠 Question Generation
- **Pre-existing Bank**: Aptitude & role-specific technical skills.  
- **AI-Generated**:  
  - Based on **Job Role** (e.g., Software Engineer, Data Scientist).  
  - Aptitude (logical, analytical).  
  - Technical (role-specific).  
- **Format**:  
  - MCQs with 3–4 options.  
  - One correct answer + distractors.  
  - Auto-graded.  

---

## 📤 Admin Interface Features
- **Dashboard**:  
  - Create new assessments.  
  - Manage question bank.  
  - Generate candidate assessment links.  
  - View performance reports:  
    - Candidate Name & Email  
    - Total Score  
    - Correct/Incorrect answers  
    - Detailed feedback  

---

## 📩 Candidate Email Invitation
Triggered when an assessment is created:  
- Personalized greeting.  
- Role information.  
- Unique 48-hour valid link.  
- Instructions & time constraints.  

---

## 📊 Report & Evaluation
- **Automatic Grading**: Score + per-question feedback.  
- **Admin Feedback**: Optional personalized comments.  

---

## 🗃 Database & Storage (Supabase)
- **Authentication**: Secure email/password with JWT.  
- **Storage**:  
  - Resumes & job descriptions stored in buckets.  
  - Signed URLs (48-hour validity).  
- **Schema**:  
  - `Users` → Admin & Candidate data.  
  - `Assessments` → Metadata (time, questions, links).  
  - `Results` → Scores, answers, feedback.  

---

## 🚨 Edge Cases
- **Expired Link** → "Expired" message, no access.  
- **Duplicate Links** → Each link is unique and one-time use.  

---

## 🎨 UI/UX Design
- **Glassmorphism + Dark Theme**  
- **Primary Colors**:  
  - Navy Blue → Headers, navigation.  
  - Green → Buttons, progress bars.  
- **Typography**: White/Light Grey for contrast.  

---

## 🛠 Tech Stack
- **Frontend**: React.js, Bootstrap, Glassmorphism styling  
- **Backend**: Node.js + Express  
- **Authentication**: Supabase Auth (email/password)  
- **Database**: Supabase Database  
- **Storage**: Supabase Storage (resumes, job descriptions)  
- **AI Integration**: For role-specific question generation  
- **Grading**: Auto-evaluation logic with weights  

---

## 🔑 Key Technical Flows

### 1. Authentication Flow
- JWT-based auth with Supabase.  
- Role-based access (Admin vs Candidate).  
- Protected routes for dashboards.  

### 2. Assessment Creation
- Multi-step wizard for setup.  
- AI-assisted question generation.  
- Question bank management.  

### 3. Assessment Taking
- Token-based link validation.  
- Real-time timers & auto-submission.  
- Progress tracking & recovery.  

---

## 🚀 Future Enhancements
- Adaptive difficulty based on candidate performance.  
- Integration with ATS (Applicant Tracking Systems).  
- Advanced analytics & reporting dashboards.  

---
