export interface ScoringBreakdown {
    skills: number;
    projects: number;
    certifications: number;
    internships: number;
    resume: number;
}

export interface ScoringResult {
    totalScore: number;
    breakdown: ScoringBreakdown;
    suggestions: string[];
    level: string;
}

const WEIGHTS = {
    skills: 0.3,
    projects: 0.25,
    certifications: 0.15,
    internships: 0.2,
    resume: 0.1,
};

export class ScoringService {
    static calculateScore(data: {
        skills: { level: number }[];
        projects: { complexity: number }[];
        certificationsCount: number;
        internshipsCount: number;
        resumeComplete: boolean;
    }): ScoringResult {
        // 1. Calculate section scores (normalized to 100)

        // Skills: Average level (1-5) converted to 100
        const skillsScore = data.skills.length > 0
            ? (data.skills.reduce((acc, s) => acc + s.level, 0) / (data.skills.length * 5)) * 100
            : 0;

        // Projects: Sum of complexity (cap at 5 projects of complexity 4/5)
        // Max projects score = 20 points total (5 projects * 4 complexity)
        const projectsScore = Math.min((data.projects.reduce((acc, p) => acc + p.complexity, 0) / 20) * 100, 100);

        // Certifications: 20 points per cert, cap at 5
        const certsScore = Math.min(data.certificationsCount * 20, 100);

        // Internships: 50 points per internship, cap at 2
        const internshipsScore = Math.min(data.internshipsCount * 50, 100);

        // Resume completeness: 100 or 0
        const resumeScore = data.resumeComplete ? 100 : 0;

        // 2. Apply weights
        const weightedScore =
            (skillsScore * WEIGHTS.skills) +
            (projectsScore * WEIGHTS.projects) +
            (certsScore * WEIGHTS.certifications) +
            (internshipsScore * WEIGHTS.internships) +
            (resumeScore * WEIGHTS.resume);

        const totalScore = Math.round(weightedScore);

        // 3. Generate suggestions
        const suggestions: string[] = [];
        if (skillsScore < 70) suggestions.push("Improve your core skills through dedicated practice.");
        if (projectsScore < 60) suggestions.push("Build more complex projects to showcase your practical abilities.");
        if (certsScore < 40) suggestions.push("Consider earning professional certifications in your field.");
        if (internshipsScore < 50) suggestions.push("Look for internship opportunities to gain real-world experience.");
        if (!data.resumeComplete) suggestions.push("Complete your resume profile to improve your visibility.");

        if (suggestions.length === 0 && totalScore < 90) {
            suggestions.push("Focus on reaching expert level in your primary skills.");
        }

        // 4. Determine level
        let level = "Beginner";
        if (totalScore >= 80) level = "Expert";
        else if (totalScore >= 60) level = "Intermediate";
        else if (totalScore >= 40) level = "Novice";

        return {
            totalScore,
            breakdown: {
                skills: Math.round(skillsScore),
                projects: Math.round(projectsScore),
                certifications: Math.round(certsScore),
                internships: Math.round(internshipsScore),
                resume: Math.round(resumeScore),
            },
            suggestions,
            level,
        };
    }
}
