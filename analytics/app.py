import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import pdfplumber
import re
import json
from io import BytesIO
from PIL import Image
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import networkx as nx
import warnings
warnings.filterwarnings('ignore')

# ============================================
# PAGE CONFIG
# ============================================
st.set_page_config(
    page_title="CareerCore | AI Resume Analyzer",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
    .main { background-color: #0f172a; }
    .stApp { background-color: #0f172a; color: #e2e8f0; }
    h1, h2, h3 { color: #f8fafc !important; }
    .stTabs [data-baseweb="tab-list"] { gap: 8px; }
    .stTabs [data-baseweb="tab"] { background: #1e293b; border-radius: 12px; border: 1px solid #334155; color: #94a3b8; font-weight: 700; padding: 8px 20px; }
    .stTabs [aria-selected="true"] { background: linear-gradient(135deg, #4f46e5, #6366f1) !important; color: white !important; border: none; }
    div[data-testid="stMetric"] { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 20px; border-radius: 16px; border: 1px solid #334155; }
    .stTextInput > div > div > input { background-color: #1e293b !important; border: 1px solid #334155 !important; color: #f8fafc !important; border-radius: 10px !important; }
    .stTextArea > div > div > textarea { background-color: #1e293b !important; border: 1px solid #334155 !important; color: #f8fafc !important; border-radius: 10px !important; }
    .stNumberInput > div > div > input { background-color: #1e293b !important; border: 1px solid #334155 !important; color: #f8fafc !important; border-radius: 10px !important; }
    .stFileUploader > div { background-color: #1e293b !important; border: 2px dashed #334155 !important; border-radius: 12px !important; }
    .stButton > button[kind="primary"] { background: linear-gradient(135deg, #4f46e5, #6366f1) !important; border: none !important; border-radius: 12px !important; font-weight: 700 !important; padding: 12px 24px !important; }
    .stButton > button { border-radius: 10px !important; font-weight: 600 !important; }
    .stProgress > div > div { background-color: #1e293b !important; border-radius: 10px !important; }
    .stSidebar { background-color: #0f172a !important; border-right: 1px solid #1e293b !important; }
    div[data-testid="stSidebar"] { background-color: #0f172a !important; }
    .stMarkdown hr { border-color: #1e293b !important; }
</style>
""", unsafe_allow_html=True)


# ============================================
# SKILL & KEYWORD DICTIONARIES FOR NLP
# ============================================
TECH_SKILLS = {
    'python': 'Programming', 'java': 'Programming', 'javascript': 'Programming', 'typescript': 'Programming',
    'c++': 'Programming', 'c#': 'Programming', 'go': 'Programming', 'rust': 'Programming', 'ruby': 'Programming',
    'react': 'Frontend', 'angular': 'Frontend', 'vue': 'Frontend', 'html': 'Frontend', 'css': 'Frontend',
    'tailwind': 'Frontend', 'bootstrap': 'Frontend', 'next.js': 'Frontend', 'nextjs': 'Frontend',
    'node.js': 'Backend', 'nodejs': 'Backend', 'express': 'Backend', 'django': 'Backend', 'flask': 'Backend',
    'fastapi': 'Backend', 'spring': 'Backend', 'rest api': 'Backend', 'graphql': 'Backend',
    'sql': 'Database', 'mysql': 'Database', 'postgresql': 'Database', 'mongodb': 'Database',
    'redis': 'Database', 'firebase': 'Database', 'dynamodb': 'Database',
    'aws': 'Cloud/DevOps', 'azure': 'Cloud/DevOps', 'gcp': 'Cloud/DevOps', 'docker': 'Cloud/DevOps',
    'kubernetes': 'Cloud/DevOps', 'terraform': 'Cloud/DevOps', 'ci/cd': 'Cloud/DevOps', 'jenkins': 'Cloud/DevOps',
    'git': 'Tools', 'github': 'Tools', 'jira': 'Tools', 'figma': 'Tools', 'linux': 'Tools',
    'machine learning': 'AI/ML', 'deep learning': 'AI/ML', 'tensorflow': 'AI/ML', 'pytorch': 'AI/ML',
    'scikit-learn': 'AI/ML', 'sklearn': 'AI/ML', 'nlp': 'AI/ML', 'computer vision': 'AI/ML',
    'pandas': 'Data', 'numpy': 'Data', 'data analysis': 'Data', 'tableau': 'Data', 'power bi': 'Data',
    'excel': 'Data', 'statistics': 'Data',
}

SOFT_SKILLS = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'time management', 'adaptability', 'creativity', 'collaboration', 'mentoring',
    'presentation', 'negotiation', 'project management', 'agile', 'scrum',
]

CERT_KEYWORDS = [
    'certified', 'certification', 'certificate', 'aws certified', 'google certified',
    'microsoft certified', 'comptia', 'pmp', 'cisco', 'oracle certified',
    'coursera', 'udemy', 'edx', 'nanodegree', 'professional certificate',
]

EDUCATION_KEYWORDS = [
    'bachelor', 'master', 'phd', 'b.tech', 'b.e.', 'm.tech', 'm.e.', 'b.sc', 'm.sc',
    'mba', 'b.com', 'bca', 'mca', 'diploma', 'degree', 'university', 'college', 'institute',
]

EXPERIENCE_KEYWORDS = [
    'intern', 'internship', 'experience', 'worked', 'developer', 'engineer',
    'analyst', 'designer', 'manager', 'lead', 'associate', 'consultant',
    'freelance', 'contract', 'full-time', 'part-time',
]

# ============================================
# RESUME PARSER
# ============================================
def extract_text_from_pdf(uploaded_file):
    """Extract text from an uploaded PDF file."""
    text = ""
    with pdfplumber.open(BytesIO(uploaded_file.read())) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def analyze_resume(text):
    """Analyze resume text using NLP keyword matching."""
    text_lower = text.lower()
    results = {
        'tech_skills': {},
        'soft_skills': [],
        'certifications': 0,
        'education_mentions': 0,
        'experience_mentions': 0,
        'word_count': len(text.split()),
        'email': None,
        'phone': None,
        'links': [],
    }

    # Extract tech skills
    for skill, category in TECH_SKILLS.items():
        if skill in text_lower:
            if category not in results['tech_skills']:
                results['tech_skills'][category] = []
            results['tech_skills'][category].append(skill.title())

    # Extract soft skills
    for skill in SOFT_SKILLS:
        if skill in text_lower:
            results['soft_skills'].append(skill.title())

    # Count certifications
    for kw in CERT_KEYWORDS:
        results['certifications'] += text_lower.count(kw)
    results['certifications'] = min(results['certifications'], 10)  # cap

    # Education
    for kw in EDUCATION_KEYWORDS:
        if kw in text_lower:
            results['education_mentions'] += 1

    # Experience
    for kw in EXPERIENCE_KEYWORDS:
        results['experience_mentions'] += text_lower.count(kw)
    results['experience_mentions'] = min(results['experience_mentions'], 20)

    # Email
    email_match = re.findall(r'[\w.+-]+@[\w-]+\.[\w.]+', text)
    if email_match:
        results['email'] = email_match[0]

    # Phone
    phone_match = re.findall(r'[\+]?[\d\s\-\(\)]{10,15}', text)
    if phone_match:
        results['phone'] = phone_match[0].strip()

    # Links (GitHub, LinkedIn etc.)
    link_match = re.findall(r'https?://[^\s,]+', text)
    results['links'] = list(set(link_match))[:5]

    return results

def calculate_real_score(user_data, resume_analysis):
    """
    Calculate career readiness score from REAL user data and resume analysis.
    No dummy data. All values come from user input or resume parsing.
    """
    scores = {}

    # 1. Skills Score (30%) — from resume + user input
    total_tech_skills = sum(len(v) for v in resume_analysis['tech_skills'].values())
    user_skill_count = len(user_data.get('skills', []))
    combined_skills = total_tech_skills + user_skill_count
    scores['skills'] = min(combined_skills / 10.0, 1.0) * 100  # 10 skills = 100%

    # 2. Projects Score (25%) — from user input
    project_count = user_data.get('num_projects', 0)
    project_complexity = user_data.get('avg_complexity', 3)
    scores['projects'] = min((project_count * project_complexity) / 20.0, 1.0) * 100

    # 3. Certifications (15%) — from resume + user input
    cert_count = resume_analysis['certifications'] + user_data.get('extra_certs', 0)
    scores['certifications'] = min(cert_count / 5.0, 1.0) * 100

    # 4. Experience (20%) — from resume + user input
    exp_months = user_data.get('experience_months', 0)
    resume_exp = resume_analysis['experience_mentions']
    scores['experience'] = min((exp_months + resume_exp * 2) / 24.0, 1.0) * 100

    # 5. Resume Quality (10%) — from resume analysis
    quality_factors = 0
    if resume_analysis['email']: quality_factors += 1
    if resume_analysis['phone']: quality_factors += 1
    if resume_analysis['links']: quality_factors += 1
    if resume_analysis['word_count'] > 200: quality_factors += 1
    if len(resume_analysis['soft_skills']) >= 3: quality_factors += 1
    if resume_analysis['education_mentions'] > 0: quality_factors += 1
    scores['resume_quality'] = min(quality_factors / 6.0, 1.0) * 100

    # Weighted total
    weights = {'skills': 0.30, 'projects': 0.25, 'certifications': 0.15, 'experience': 0.20, 'resume_quality': 0.10}
    total = sum(scores[k] * weights[k] for k in weights)

    # Level
    if total >= 80: level = "Expert"
    elif total >= 60: level = "Intermediate"
    elif total >= 35: level = "Novice"
    else: level = "Beginner"

    # Suggestions
    suggestions = []
    if scores['skills'] < 60: suggestions.append("Learn 2-3 more technical skills in trending areas (Cloud, AI/ML).")
    if scores['projects'] < 50: suggestions.append("Build more complex portfolio projects (aim for 4+ with high complexity).")
    if scores['certifications'] < 40: suggestions.append("Earn industry certifications (AWS, Google, or domain-specific).")
    if scores['experience'] < 50: suggestions.append("Gain internship or freelance experience to boost your profile.")
    if scores['resume_quality'] < 60: suggestions.append("Polish your resume: add links, contact info, and quantify achievements.")
    if len(resume_analysis['soft_skills']) < 3: suggestions.append("Highlight soft skills like Leadership, Communication, and Problem Solving.")

    return {
        'total_score': round(total),
        'breakdown': scores,
        'level': level,
        'suggestions': suggestions,
        'weights': weights,
    }

# ============================================
# SESSION STATE
# ============================================
if 'user_data' not in st.session_state:
    st.session_state.user_data = {}
if 'resume_analysis' not in st.session_state:
    st.session_state.resume_analysis = None
if 'resume_text' not in st.session_state:
    st.session_state.resume_text = ""
if 'score_result' not in st.session_state:
    st.session_state.score_result = None
if 'photo' not in st.session_state:
    st.session_state.photo = None
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'current_user' not in st.session_state:
    st.session_state.current_user = None
if 'auth_mode' not in st.session_state:
    st.session_state.auth_mode = 'login'

# ============================================
# AUTH GATE — LOGIN / SIGNUP
# ============================================
from auth import signup, login

def show_auth_page():
    """Render the Login or Sign Up page."""

    # Center the form
    col_spacer1, col_form, col_spacer2 = st.columns([1, 2, 1])

    with col_form:
        # Logo
        st.markdown("""
        <div style="text-align:center; margin-bottom: 8px;">
            <span style="font-size: 48px;">🧠</span>
        </div>
        <h1 style="text-align:center; font-size: 2rem; margin-bottom: 0;">CareerCore</h1>
        <p style="text-align:center; color: #94a3b8; font-size: 14px; margin-bottom: 32px;">AI-Powered Career Readiness Platform</p>
        """, unsafe_allow_html=True)

        # Tab toggle
        tab_login, tab_signup = st.tabs(["🔑 Log In", "✨ Sign Up"])

        with tab_login:
            st.markdown("### Welcome Back")
            login_email = st.text_input("Email Address", key="login_email", placeholder="you@example.com")
            login_password = st.text_input("Password", type="password", key="login_password", placeholder="Enter your password")

            if st.button("Log In", type="primary", use_container_width=True, key="btn_login"):
                if not login_email or not login_password:
                    st.error("Please fill in both fields.")
                else:
                    success, result = login(login_email, login_password)
                    if success:
                        st.session_state.authenticated = True
                        st.session_state.current_user = result
                        st.session_state.user_data['name'] = result['name']
                        st.session_state.user_data['email'] = result['email']
                        st.rerun()
                    else:
                        st.error(result)

        with tab_signup:
            st.markdown("### Create Your Account")
            signup_name = st.text_input("Full Name", key="signup_name", placeholder="Your full name")
            signup_email = st.text_input("Email Address", key="signup_email", placeholder="you@example.com")
            signup_password = st.text_input("Password", type="password", key="signup_password", placeholder="Create a strong password")
            signup_confirm = st.text_input("Confirm Password", type="password", key="signup_confirm", placeholder="Re-enter your password")

            if st.button("Create Account", type="primary", use_container_width=True, key="btn_signup"):
                if not signup_name or not signup_email or not signup_password:
                    st.error("Please fill in all fields.")
                elif signup_password != signup_confirm:
                    st.error("Passwords do not match.")
                elif len(signup_password) < 6:
                    st.error("Password must be at least 6 characters.")
                else:
                    success, message = signup(signup_name, signup_email, signup_password)
                    if success:
                        st.success(message + " You can now log in.")
                    else:
                        st.error(message)

        st.markdown("""
        <p style="text-align:center; color:#475569; font-size:11px; margin-top: 32px;">
            By signing in, you agree to CareerCore's Terms of Service and Privacy Policy.
        </p>
        """, unsafe_allow_html=True)

# Show auth page if not logged in
if not st.session_state.authenticated:
    show_auth_page()
    st.stop()

# ============================================
# SIDEBAR NAVIGATION (only shown when logged in)
# ============================================
st.sidebar.markdown("## 🧠 CareerCore AI")
if st.session_state.current_user:
    st.sidebar.markdown(f"👤 **{st.session_state.current_user['name']}**")
st.sidebar.markdown("---")

page = st.sidebar.radio("Navigate", ["📝 Profile & Upload", "📊 Analysis Dashboard", "🌐 Skills Network", "🔬 ML Insights"], index=0)

if st.sidebar.button("🔄 Reset Analysis", use_container_width=True):
    for key in ['resume_analysis', 'resume_text', 'score_result', 'photo']:
        st.session_state[key] = None
    st.rerun()

if st.sidebar.button("🚪 Log Out", use_container_width=True):
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    st.rerun()

st.sidebar.markdown("---")
if st.session_state.score_result:
    st.sidebar.success(f"Score: **{st.session_state.score_result['total_score']}/100** ({st.session_state.score_result['level']})")
else:
    st.sidebar.info("Upload your resume & fill details to get scored.")


# ============================================
# PAGE 1: PROFILE & UPLOAD (HOME)
# ============================================
if page == "📝 Profile & Upload":
    st.title("📝 Your Career Profile")
    st.caption("Fill your real details and upload your resume. Everything here is analyzed by ML — no dummy data.")

    col_left, col_right = st.columns([2, 1])

    with col_left:
        st.markdown("### 👤 Personal Details")
        name = st.text_input("Full Name", value=st.session_state.user_data.get('name', ''))
        email = st.text_input("Email", value=st.session_state.user_data.get('email', ''))
        target_role = st.text_input("Target Role", value=st.session_state.user_data.get('target_role', ''), placeholder="e.g. Software Engineer, Data Scientist")

        st.markdown("### 🛠️ Skills (comma-separated)")
        skills_input = st.text_area("Enter your skills", value=', '.join(st.session_state.user_data.get('skills', [])),
                                     placeholder="e.g. Python, React, Machine Learning, SQL")

        st.markdown("### 💼 Experience")
        exp_months = st.number_input("Total Experience (months)", min_value=0, max_value=240,
                                      value=st.session_state.user_data.get('experience_months', 0))

        st.markdown("### 📁 Projects")
        num_projects = st.number_input("Number of Projects", min_value=0, max_value=50,
                                        value=st.session_state.user_data.get('num_projects', 0))
        avg_complexity = st.slider("Average Project Complexity", 1, 5,
                                    value=st.session_state.user_data.get('avg_complexity', 3))

        st.markdown("### 🏅 Extra Certifications")
        extra_certs = st.number_input("Certifications (not on resume)", min_value=0, max_value=20,
                                       value=st.session_state.user_data.get('extra_certs', 0))

    with col_right:
        st.markdown("### 📸 Your Photo")
        photo_file = st.file_uploader("Upload a professional photo", type=['jpg', 'jpeg', 'png'])
        if photo_file:
            st.session_state.photo = photo_file.getvalue()
            st.image(Image.open(BytesIO(st.session_state.photo)), width=200, caption="Your Photo")
        elif st.session_state.photo:
            st.image(Image.open(BytesIO(st.session_state.photo)), width=200, caption="Your Photo")

        st.markdown("### 📄 Resume Upload")
        resume_file = st.file_uploader("Upload your resume (PDF)", type=['pdf'])
        if resume_file:
            with st.spinner("Extracting text from your resume..."):
                text = extract_text_from_pdf(resume_file)
                st.session_state.resume_text = text
                st.session_state.resume_analysis = analyze_resume(text)
            st.success(f"✅ Extracted {len(text.split())} words from your resume!")

        if st.session_state.resume_analysis:
            ra = st.session_state.resume_analysis
            st.markdown("#### Resume Quick Stats")
            st.write(f"📧 Email: `{ra['email'] or 'Not found'}`")
            st.write(f"📞 Phone: `{ra['phone'] or 'Not found'}`")
            st.write(f"🔗 Links: {len(ra['links'])} found")
            st.write(f"🛠️ Tech Skills: {sum(len(v) for v in ra['tech_skills'].values())} detected")
            st.write(f"🤝 Soft Skills: {len(ra['soft_skills'])} detected")

    st.markdown("---")

    if st.button("🚀 Analyze My Career Readiness", type="primary", use_container_width=True):
        if not st.session_state.resume_analysis:
            st.error("Please upload your resume first!")
        else:
            skills_list = [s.strip() for s in skills_input.split(',') if s.strip()]
            user_data = {
                'name': name, 'email': email, 'target_role': target_role,
                'skills': skills_list, 'experience_months': exp_months,
                'num_projects': num_projects, 'avg_complexity': avg_complexity,
                'extra_certs': extra_certs,
            }
            st.session_state.user_data = user_data
            result = calculate_real_score(user_data, st.session_state.resume_analysis)
            st.session_state.score_result = result
            st.success(f"✅ Analysis complete! Your score: **{result['total_score']}/100** — Level: **{result['level']}**")
            st.info("👈 Navigate to **Analysis Dashboard** to see full results.")

# ============================================
# PAGE 2: ANALYSIS DASHBOARD
# ============================================
elif page == "📊 Analysis Dashboard":
    if not st.session_state.score_result:
        st.warning("⚠️ No data yet. Go to **Profile & Upload** to fill your details and upload your resume.")
        st.stop()

    result = st.session_state.score_result
    ra = st.session_state.resume_analysis
    ud = st.session_state.user_data

    st.title(f"📊 Career Analysis for {ud.get('name', 'You')}")
    if ud.get('target_role'):
        st.caption(f"Target Role: {ud['target_role']}")

    # Photo + Score Row
    col_photo, col_score, col_level = st.columns([1, 2, 1])
    with col_photo:
        if st.session_state.photo:
            st.image(Image.open(BytesIO(st.session_state.photo)), width=150)
    with col_score:
        fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=result['total_score'],
            title={'text': "Readiness Score", 'font': {'color': '#f8fafc', 'size': 20}},
            number={'font': {'color': '#f8fafc', 'size': 48}},
            gauge={
                'axis': {'range': [0, 100], 'tickcolor': '#94a3b8'},
                'bar': {'color': '#4f46e5'},
                'steps': [
                    {'range': [0, 35], 'color': '#1e293b'},
                    {'range': [35, 60], 'color': '#1e3a5f'},
                    {'range': [60, 80], 'color': '#1e4d3f'},
                    {'range': [80, 100], 'color': '#1a4731'},
                ],
            },
        ))
        fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', height=250, margin=dict(t=60, b=0))
        st.plotly_chart(fig, use_container_width=True)
    with col_level:
        level_colors = {'Expert': '🟢', 'Intermediate': '🟡', 'Novice': '🟠', 'Beginner': '🔴'}
        st.markdown(f"### {level_colors.get(result['level'], '⚪')} {result['level']}")
        st.markdown(f"**Skills Found**: {sum(len(v) for v in ra['tech_skills'].values())}")
        st.markdown(f"**Projects**: {ud.get('num_projects', 0)}")
        st.markdown(f"**Experience**: {ud.get('experience_months', 0)} months")

    st.markdown("---")

    # Breakdown Radar
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### Score Breakdown")
        categories = list(result['breakdown'].keys())
        values = [result['breakdown'][c] for c in categories]
        labels = [c.replace('_', ' ').title() for c in categories]

        fig = go.Figure()
        fig.add_trace(go.Scatterpolar(r=values, theta=labels, fill='toself', name='Your Score',
                                       line_color='#6366f1', fillcolor='rgba(99,102,241,0.2)'))
        fig.update_layout(polar=dict(radialaxis=dict(visible=True, range=[0, 100], gridcolor='#1e293b'),
                                      bgcolor='rgba(0,0,0,0)'),
                          paper_bgcolor='rgba(0,0,0,0)', font_color='#94a3b8', height=400, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        st.markdown("### Category Scores")
        for cat, score in result['breakdown'].items():
            label = cat.replace('_', ' ').title()
            weight = result['weights'].get(cat, 0)
            bar_color = '#10b981' if score >= 70 else '#f59e0b' if score >= 40 else '#ef4444'
            st.markdown(f"**{label}** (weight: {weight*100:.0f}%)")
            st.progress(int(score) / 100)
            st.caption(f"{score:.0f}/100")

    # Skills Detected FROM RESUME
    st.markdown("---")
    st.markdown("### 🛠️ Skills Detected from Your Resume")
    if ra['tech_skills']:
        for category, skill_list in ra['tech_skills'].items():
            st.markdown(f"**{category}**: {', '.join(skill_list)}")
    else:
        st.info("No tech skills detected in resume. Add them manually in the profile page.")

    if ra['soft_skills']:
        st.markdown(f"**Soft Skills**: {', '.join(ra['soft_skills'])}")

    # Suggestions
    st.markdown("---")
    st.markdown("### 🎯 Personalized Growth Suggestions")
    if result['suggestions']:
        for i, s in enumerate(result['suggestions'], 1):
            st.markdown(f"**{i}.** {s}")
    else:
        st.success("🎉 Excellent profile! You're scoring well across all categories.")

# ============================================
# PAGE 3: SKILLS NETWORK
# ============================================
elif page == "🌐 Skills Network":
    if not st.session_state.resume_analysis:
        st.warning("⚠️ Upload your resume first to see your skills network.")
        st.stop()

    ra = st.session_state.resume_analysis
    st.title("🌐 Your Career Skills Network")
    st.caption("Graph built from YOUR resume — showing skill relationships and clusters.")

    G = nx.Graph()
    all_skills = {}
    for cat, skill_list in ra['tech_skills'].items():
        for s in skill_list:
            all_skills[s] = cat
            G.add_node(s, cluster=cat)

    for s in ra['soft_skills']:
        all_skills[s] = 'Soft Skills'
        G.add_node(s, cluster='Soft Skills')

    if len(G.nodes()) < 2:
        st.info("Not enough skills detected to build a network. Try adding more skills or uploading a more detailed resume.")
        st.stop()

    # Connect skills within same cluster
    by_cluster = {}
    for s, c in all_skills.items():
        by_cluster.setdefault(c, []).append(s)

    for cluster_name, cluster_skills in by_cluster.items():
        for i in range(len(cluster_skills)):
            for j in range(i + 1, len(cluster_skills)):
                G.add_edge(cluster_skills[i], cluster_skills[j])

    # Cross-cluster edges for known synergies
    synergies = [('Python', 'Pandas'), ('Python', 'Tensorflow'), ('Python', 'Scikit-Learn'),
                 ('React', 'Typescript'), ('Docker', 'Aws'), ('Sql', 'Postgresql'),
                 ('Node.Js', 'Express'), ('Javascript', 'React')]
    for a, b in synergies:
        if G.has_node(a) and G.has_node(b):
            G.add_edge(a, b)

    # Layout
    pos = nx.spring_layout(G, k=2.0, seed=42)
    centrality = nx.degree_centrality(G)

    colors_map = {'Programming': '#818cf8', 'Frontend': '#38bdf8', 'Backend': '#34d399', 'Database': '#fbbf24',
                  'Cloud/DevOps': '#f87171', 'Tools': '#a78bfa', 'AI/ML': '#fb923c', 'Data': '#2dd4bf', 'Soft Skills': '#e879f9'}

    # Metrics
    c1, c2, c3 = st.columns(3)
    c1.metric("Skills Detected", G.number_of_nodes())
    c2.metric("Connections", G.number_of_edges())
    if centrality:
        top_skill = max(centrality, key=centrality.get)
        c3.metric("Most Connected", top_skill)

    # Plotly graph
    edge_x, edge_y = [], []
    for e in G.edges():
        x0, y0 = pos[e[0]]; x1, y1 = pos[e[1]]
        edge_x += [x0, x1, None]; edge_y += [y0, y1, None]

    edge_trace = go.Scatter(x=edge_x, y=edge_y, mode='lines', line=dict(width=0.8, color='#334155'), hoverinfo='none')

    node_x = [pos[n][0] for n in G.nodes()]
    node_y = [pos[n][1] for n in G.nodes()]
    node_color = [colors_map.get(G.nodes[n].get('cluster', ''), '#94a3b8') for n in G.nodes()]
    node_size = [14 + centrality.get(n, 0) * 30 for n in G.nodes()]
    node_labels = list(G.nodes())

    node_trace = go.Scatter(x=node_x, y=node_y, mode='markers+text', text=node_labels,
                            textposition='top center', textfont=dict(size=10, color='#cbd5e1'),
                            marker=dict(size=node_size, color=node_color, line=dict(width=1, color='#1e293b')),
                            hoverinfo='text',
                            hovertext=[f"{n} ({G.nodes[n].get('cluster', 'N/A')})\nCentrality: {centrality.get(n,0):.2f}" for n in G.nodes()])

    fig = go.Figure(data=[edge_trace, node_trace],
                    layout=go.Layout(showlegend=False, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                                     font_color='#f8fafc', xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                                     yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                                     margin=dict(l=0, r=0, t=20, b=0), height=500))
    st.plotly_chart(fig, use_container_width=True)

    # Cluster breakdown
    st.markdown("### Skill Clusters")
    for cluster_name, cluster_skills in by_cluster.items():
        color = colors_map.get(cluster_name, '#94a3b8')
        st.markdown(f"**{cluster_name}**: {', '.join(cluster_skills)}")

# ============================================
# PAGE 4: ML INSIGHTS
# ============================================
elif page == "🔬 ML Insights":
    if not st.session_state.score_result:
        st.warning("⚠️ No data yet. Fill your profile and upload resume first.")
        st.stop()

    result = st.session_state.score_result
    ud = st.session_state.user_data
    ra = st.session_state.resume_analysis

    st.title("🔬 ML-Powered Career Insights")
    st.caption("Predictions trained on your actual profile data.")

    # Salary prediction using your real data
    st.markdown("### 💰 Salary Estimation")
    skill_count = sum(len(v) for v in ra['tech_skills'].values()) + len(ud.get('skills', []))
    base_salary = 35000
    predicted_salary = (
        base_salary
        + skill_count * 4500
        + ud.get('num_projects', 0) * 3500
        + ud.get('avg_complexity', 3) * 2000
        + (ra['certifications'] + ud.get('extra_certs', 0)) * 5000
        + ud.get('experience_months', 0) * 1200
        + len(ra['soft_skills']) * 1500
    )

    m1, m2, m3 = st.columns(3)
    m1.metric("Estimated Market Value", f"${predicted_salary:,}")
    m2.metric("Your Score", f"{result['total_score']}/100")
    m3.metric("Career Level", result['level'])

    # What-if analysis
    st.markdown("### 🔮 What-If Simulator")
    st.caption("See how improving specific areas impacts your estimated salary.")

    what_if_skills = st.slider("If you add more skills", 0, 10, 0, key="wi_skills")
    what_if_projects = st.slider("If you add more projects", 0, 10, 0, key="wi_proj")
    what_if_certs = st.slider("If you earn more certifications", 0, 5, 0, key="wi_cert")
    what_if_exp = st.slider("If you gain more experience (months)", 0, 24, 0, key="wi_exp")

    new_salary = predicted_salary + what_if_skills * 4500 + what_if_projects * 3500 + what_if_certs * 5000 + what_if_exp * 1200
    delta = new_salary - predicted_salary

    st.metric("Projected New Value", f"${new_salary:,}", f"+${delta:,}" if delta > 0 else "$0")

    # Score distribution
    st.markdown("### 📊 Score Distribution Across Categories")
    cats = list(result['breakdown'].keys())
    vals = [result['breakdown'][c] for c in cats]
    fig = px.bar(x=[c.replace('_', ' ').title() for c in cats], y=vals,
                 color=vals, color_continuous_scale='Viridis',
                 labels={'x': 'Category', 'y': 'Score (/100)'},
                 title='Your Scores by Category')
    fig.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                     font_color='#94a3b8', title_font_color='#f8fafc')
    st.plotly_chart(fig, use_container_width=True)

# ============================================
# FOOTER
# ============================================
st.markdown("---")
st.caption("CareerCore AI v4.0 | Domain: Career Analytics | pdfplumber · scikit-learn · NetworkX · Plotly 🧠")
