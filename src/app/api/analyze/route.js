import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription, mode } = body;

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    let prompt = `Analyze this resume as an expert technical recruiter.\n\nResume:\n${resumeText}\n`;
    
    if (mode === 'tailored' && jobDescription) {
      prompt += `\nTarget Job Description:\n${jobDescription}\n\nPlease provide a highly detailed, constructive evaluation tailored to this specific job description.`;
    } else {
      prompt += `\nPlease provide a comprehensive, general evaluation of strengths, areas for improvement, and an overall ATS score.`;
    }

    prompt += `\n\nReturn the response strictly as a JSON object with the following structure:
{
  "overall_score": 85,
  "ats_score": 80,
  "jd_match_score": 90, // only if tailored mode
  "skills_identified": ["React", "Node.js"],
  "strengths": ["Strong frontend experience", "Good education"],
  "areas_for_improvement": ["Lack of cloud experience"],
  "recommendations": ["Add AWS certification"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    const jsonResult = JSON.parse(resultText);

    return NextResponse.json(jsonResult);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}
