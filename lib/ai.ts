import Anthropic from '@anthropic-ai/sdk';
import { sql } from './db';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface IncidentAnalysis {
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  immediateActions: string[];
  possibleCauses: string[];
  escalateTo: string;
  relatedDocuments: string[];
  safetyWarnings: string[];
}

export async function analyzeIncident(transcript: string, department?: string, shift?: string, machine?: string): Promise<IncidentAnalysis> {
  // Fetch relevant document excerpts from the knowledge base
  const docs = await sql`SELECT original_name, extracted_text, category FROM documents LIMIT 10` as {
    original_name: string;
    extracted_text: string;
    category: string;
  }[];

  const knowledgeBase = docs.length > 0
    ? docs.map(d => `[${d.original_name} - ${d.category}]\n${d.extracted_text?.slice(0, 2000)}`).join('\n\n---\n\n')
    : 'No documents uploaded yet. Providing general manufacturing incident guidance.';

  const systemPrompt = `You are VoiceOps, an AI incident handler for Scania's production line operators.
You analyze voice-reported incidents and provide immediate, actionable guidance.

Operators are hands-on factory workers, not IT people. Keep language simple, direct, and jargon-free.
Prioritize safety above all else.

Your knowledge base contains plant-specific documents:
---
${knowledgeBase}
---

Always respond with a JSON object in this exact structure:
{
  "summary": "Brief 1-sentence summary of the incident",
  "severity": "low|medium|high|critical",
  "immediateActions": ["Step 1...", "Step 2...", "Step 3..."],
  "possibleCauses": ["Cause 1...", "Cause 2..."],
  "escalateTo": "Who should be notified (e.g., Line Supervisor, Maintenance Team, Safety Officer)",
  "relatedDocuments": ["Document name if relevant"],
  "safetyWarnings": ["Any immediate safety concerns"]
}

Severity guide:
- low: minor quality issue, no safety risk, line can continue
- medium: process deviation, needs attention within the hour
- high: line should pause, specialist needed immediately
- critical: safety risk, evacuate/stop line immediately`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Department: ${department || 'Unknown'}\nShift: ${shift || 'Unknown'}\nMachine / Station: ${machine || 'Not specified'}\n\nOperator reported: "${transcript}"`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]) as IncidentAnalysis;
  } catch {
    // Fallback if parsing fails
    return {
      summary: 'Incident recorded and being processed.',
      severity: 'medium',
      immediateActions: ['Alert your line supervisor immediately', 'Do not attempt to fix without authorization', 'Document what you observed'],
      possibleCauses: ['Requires further investigation'],
      escalateTo: 'Line Supervisor',
      relatedDocuments: [],
      safetyWarnings: ['Follow all standard safety protocols'],
    };
  }
}
