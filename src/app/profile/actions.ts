'use server';

import { db } from '@/db';
import { skills, projects, certifications, internships, resumeProfiles } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function addSkill(userId: string, name: string, level: number) {
    await db.insert(skills).values({ userId, name, level });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
}

export async function addProject(userId: string, name: string, complexity: number) {
    await db.insert(projects).values({ userId, name, complexity });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
}

export async function addCertification(userId: string, name: string, issuer: string) {
    await db.insert(certifications).values({ userId, name, issuer, date: new Date() });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
}

export async function addInternship(userId: string, company: string, role: string, durationMonths: number) {
    await db.insert(internships).values({ userId, company, role, durationMonths });
    revalidatePath('/profile');
    revalidatePath('/dashboard');
}

export async function toggleResumeComplete(userId: string, isComplete: boolean) {
    const existing = await db.query.resumeProfiles.findFirst({
        where: (rp, { eq }) => eq(rp.userId, userId),
    });

    if (existing) {
        await db.update(resumeProfiles)
            .set({ isComplete, lastUpdated: new Date() })
            .where((rp, { eq }) => eq(rp.userId, userId));
    } else {
        await db.insert(resumeProfiles).values({ userId, isComplete });
    }
    revalidatePath('/profile');
    revalidatePath('/dashboard');
}
