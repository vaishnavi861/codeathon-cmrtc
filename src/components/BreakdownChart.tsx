'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface BreakdownChartProps {
    data: {
        skills: number;
        projects: number;
        certifications: number;
        internships: number;
        resume: number;
    };
}

export default function BreakdownChart({ data }: BreakdownChartProps) {
    const chartData = [
        { subject: 'Skills', A: data.skills, fullMark: 100 },
        { subject: 'Projects', A: data.projects, fullMark: 100 },
        { subject: 'Certs', A: data.certifications, fullMark: 100 },
        { subject: 'Intern', A: data.internships, fullMark: 100 },
        { subject: 'Resume', A: data.resume, fullMark: 100 },
    ];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                        name="Score"
                        dataKey="A"
                        stroke="#6366f1"
                        fill="#4f46e5"
                        fillOpacity={0.5}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
