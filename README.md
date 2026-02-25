# 🎯 Career Readiness Scoring System

> **Domain**: Career Analytics | **Tags**: Career

## Problem Statement

Develop a scoring system that calculates a **Career Readiness Score** based on parameters such as **skills**, **certifications**, **projects**, **internships**, and **resume completeness**.

### Expected MVP
- ✅ **Weighted Scoring Logic** — Multi-parameter weighted algorithm
- ✅ **Visual Readiness Score** — Gauge + Radar + Bar charts
- ✅ **Improvement Suggestions** — Personalized growth recommendations

---

## 🚀 Solution Overview

**CareerCore** is a full-stack career analytics platform that analyzes a user's **real resume (PDF)** and profile data using **NLP** and **ML models** to produce a weighted career readiness score with visual breakdowns and actionable suggestions.

### Architecture

```
┌─────────────────────────────────────────────┐
│           Next.js Frontend (Port 3000)      │
│  Landing Page → Profile Setup → Dashboard   │
├─────────────────────────────────────────────┤
│         Streamlit Analytics (Port 8501)     │
│  Login/Signup → Resume Upload → ML Analysis │
│  Skills Network → What-If Simulator        │
├─────────────────────────────────────────────┤
│              Core Engine                     │
│  pdfplumber │ NLP │ scikit-learn │ NetworkX │
└─────────────────────────────────────────────┘
```

### Scoring Parameters & Weights

| Parameter | Weight | Source |
|-----------|--------|--------|
| **Skills** | 30% | Resume NLP + Manual Input |
| **Projects** | 25% | Manual (count × complexity) |
| **Experience/Internships** | 20% | Resume NLP + Manual |
| **Certifications** | 15% | Resume NLP + Manual |
| **Resume Quality** | 10% | Auto (email, phone, links, length) |

### Key Features

1. **Real Resume Upload** — Upload PDF, pdfplumber extracts text
2. **NLP Skill Detection** — 80+ tech skills, 15 soft skills, cert/education keywords
3. **Weighted Score** — 0-100 composite score with 5 categories
4. **Visual Dashboard** — Gauge, Radar chart, Progress bars, Bar charts
5. **Skills Network Graph** — NetworkX graph built from YOUR resume
6. **Salary Estimation** — ML-based market value prediction
7. **What-If Simulator** — See impact of adding skills/projects/certs
8. **Personalized Suggestions** — Targeted growth recommendations
9. **Authentication** — Login/Signup with hashed passwords

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Analytics | Streamlit, Python |
| ML/NLP | scikit-learn, pdfplumber, regex |
| Graphs | NetworkX, Plotly |
| Charts | Recharts (Next.js), Plotly (Streamlit) |
| Auth | SHA-256 hashed JSON storage |
| DB Schema | Drizzle ORM + PostgreSQL |

---

## ▶️ How to Run

### Streamlit App (Main Analytics)
```bash
cd career-score/analytics
pip install -r requirements.txt
streamlit run app.py
# → http://localhost:8501
```

### Next.js Frontend
```bash
cd career-score
npm install
npm run dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```
career-score/
├── analytics/
│   ├── app.py              # Streamlit main app (login + resume + analysis)
│   ├── auth.py             # Authentication module
│   └── requirements.txt    # Python dependencies
├── src/
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── profile/page.tsx # Profile setup
│   │   ├── dashboard/page.tsx # Dashboard
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Design system
│   ├── components/
│   │   └── BreakdownChart.tsx # Radar chart
│   ├── server/services/
│   │   └── scoring.service.ts # Scoring engine
│   └── db/
│       ├── schema.ts        # Database schema
│       └── index.ts         # DB connection
└── README.md
```

---

**Built for Codeathon CMRTC 2026** 🏆
