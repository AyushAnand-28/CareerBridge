import Groq from 'groq-sdk';

interface MatchResult {
    score: number;
    analysis: string;
}

/**
 * Keyword-based fallback when no API key is configured.
 * Checks both the profile skills and the parsed resume text for matches.
 */
function keywordFallback(techStack: string[], candidateSkills: string[], resumeText: string): MatchResult {
    if (!techStack.length) return { score: 0, analysis: 'No tech stack defined for this job.' };
    
    const normalisedSkills = candidateSkills.map(s => s.toLowerCase());
    const normalisedResume = resumeText.toLowerCase();
    
    const matched = techStack.filter(t => {
        const lowerT = t.toLowerCase();
        return normalisedSkills.includes(lowerT) || normalisedResume.includes(lowerT);
    });
    
    const score = Math.round((matched.length / techStack.length) * 100);
    const missing = techStack.filter(t => !matched.includes(t));
    
    const analysis = matched.length
        ? `Keyword match: ${matched.join(', ')} found.${missing.length ? ` Missing: ${missing.slice(0, 3).join(', ')}.` : ' Full match!'}`
        : `No matching skills found. Job requires: ${techStack.slice(0, 4).join(', ')}.`;
    return { score, analysis };
}

/**
 * Sends the resume text + job details to Groq and returns a score + analysis.
 */
export async function analyzeResumeMatch(
    resumeText: string,
    jobTitle: string,
    jobDescription: string,
    techStack: string[],
    candidateSkills: string[],
): Promise<MatchResult> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key') {
        console.log('[AI] No GROQ_API_KEY set, using keyword fallback.');
        return keywordFallback(techStack, candidateSkills, resumeText);
    }

    try {
        const groq = new Groq({ apiKey });

        const prompt = `You are an expert technical recruiter ATS system. Analyze this job application and respond ONLY with a valid JSON object.

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription.slice(0, 1500)}
REQUIRED TECH STACK: ${techStack.join(', ') || 'Not specified'}

CANDIDATE RESUME:
${resumeText.slice(0, 3000)}

CANDIDATE LISTED SKILLS: ${candidateSkills.join(', ') || 'None listed'}

Respond with ONLY this JSON (no markdown, no code blocks):
{"score": <integer 0-100>, "analysis": "<2-3 concise sentences evaluating fit, highlighting strengths and gaps>"}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile', // using a fast, high quality groq model
            temperature: 0.1, // low temp for deterministic JSON output
        });

        const raw = chatCompletion.choices[0]?.message?.content?.trim() || '{}';

        // Strip markdown code fences if model wraps the JSON
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as { score: number; analysis: string };

        return {
            score: Math.min(100, Math.max(0, Math.round(parsed.score))),
            analysis: parsed.analysis || 'Analysis unavailable.',
        };
    } catch (err) {
        console.error('[AI] Groq analysis failed, falling back to keyword match:', err);
        return keywordFallback(techStack, candidateSkills, resumeText);
    }
}
