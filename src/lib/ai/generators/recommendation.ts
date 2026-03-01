import { SupabaseClient } from "@supabase/supabase-js";
import { UserContext } from "./comparison-insight";

export interface RecommendationResult {
  slugs: string[];
  name: string;
  explanation: string;
  trendReason: string;
}

/**
 * Generates a tailored technology comparison recommendation based on user goals and current trends.
 */
export async function generateRecommendation(
  goal: string,
  focus: string,
  level: string,
  provider: any, // AI provider from key-manager
  supabase: SupabaseClient
): Promise<RecommendationResult> {
  // 1. Fetch some trending technologies from the DB to provide as context to the LLM
  const { data: trending } = await supabase
    .from("technologies")
    .select("name, slug, category, description")
    .order("id", { ascending: false }) // Just a proxy for "recent/trending" if we don't have momentum here
    .limit(20);

  const techContext =
    (trending || [])
      .map((t) => `- ${t.name} (${t.slug}): ${t.description ?? "No description"}`)
      .join("\n") || "No recent tech data.";

  const prompt = `
You are an expert technology consultant for DevTrends.
A user is asking for a recommendation on what technologies they should compare.

USER CONTEXT:
- Goal: ${goal}
- Focus/Domain: ${focus}
- Experience Level: ${level}

TRENDING TECHNOLOGIES IN OUR DATABASE:
${techContext}

TASK:
Based on the user's goal, domain, and experience level, recommend 2 (and ONLY 2) technologies for them to compare right now.
Choose technologies that are highly relevant to their goal and currently trending or important in the industry.

FORMAT:
Return a JSON object with exactly these fields:
- "slugs": Array of 2 strings (must match slugs from the list above if possible, or common tech slugs like 'react', 'vue', 'nodejs', 'go', 'rust', 'python', 'fastapi', 'terraform', 'kubernetes', 'postgresql', 'mongodb').
- "name": A human-readable name for the comparison (e.g., "React vs Vue" or "Go vs Rust").
- "explanation": A 1-2 sentence explanation of why this comparison is valuable for THEIR specific goal/level.
- "trendReason": A short phrase about why these are trending (e.g., "Rising adoption in enterprise" or "New major releases").

RESPONSE MUST BE ONLY THE JSON OBJECT.
`;

  try {
    const response = await provider.generateText({
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    const text = response.text.trim();
    // Extract JSON if there's any markdown wrapping
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(jsonStr) as RecommendationResult;
  } catch (error) {
    console.error("[AI Recommendation] Generation failed:", error);
    throw error;
  }
}
