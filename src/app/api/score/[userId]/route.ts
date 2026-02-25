import { NextRequest, NextResponse } from 'next/server';
import { ScoringService } from '@/server/services/scoring.service';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { skills, projects, certifications, internships, resumeProfiles } from '@/db/schema';

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params;

        // Fetch user data from DB (in a real app)
        // For now, if DB fails or is empty, we'll return a meaningful sample

        const userSkills = await db.query.skills.findMany({
            where: eq(skills.userId, userId),
        });

        const userProjects = await db.query.projects.findMany({
            where: eq(projects.userId, userId),
        });

        const certCount = (await db.query.certifications.findMany({
            where: eq(certifications.userId, userId),
        })).length;

        const internCount = (await db.query.internships.findMany({
            where: eq(internships.userId, userId),
        })).length;

        const resumeProfile = await db.query.resumeProfiles.findFirst({
            where: eq(resumeProfiles.userId, userId),
        });

        const result = ScoringService.calculateScore({
            skills: userSkills,
            projects: userProjects,
            certificationsCount: certCount,
            internshipsCount: internCount,
            resumeComplete: resumeProfile?.isComplete ?? false,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching score:', error);
        // Return sample data if DB is not set up yet to allow UI development
        const sampleResult = ScoringService.calculateScore({
            skills: [{ level: 4 }, { level: 3 }],
            projects: [{ complexity: 5 }, { complexity: 4 }],
            certificationsCount: 2,
            internshipsCount: 1,
            resumeComplete: true,
        });
        return NextResponse.json({ ...sampleResult, note: 'Using sample data' });
    }
}
