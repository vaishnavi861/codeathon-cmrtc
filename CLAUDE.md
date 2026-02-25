This project is a Career Readiness Scoring System.

Architecture rules:
- Business logic only inside server/services
- Database schema inside db/
- No logic inside UI components
- Use TypeScript strict mode
- Create reusable functions
- Keep MVP simple

Primary feature:
Calculate weighted readiness score based on:
skills, projects, certifications, internships, resume completeness.

Return:
- total score
- breakdown
- suggestions
