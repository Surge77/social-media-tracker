/**
 * Prompt Version Management System
 * Load, version, and manage AI prompts from database
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface PromptVersion {
  id: string
  promptType: string
  version: number
  content: string
  isActive: boolean
  avgQualityScore?: number
  positiveFeedbackRate?: number
  createdAt: string
}

export interface CreatePromptInput {
  promptType: string
  content: string
}

export interface UpdatePromptInput {
  content: string
}

/**
 * Get active prompt by type
 */
export async function getActivePrompt(
  supabase: SupabaseClient,
  promptType: string
): Promise<string | null> {
  const { data } = await supabase
    .from('prompt_versions')
    .select('content')
    .eq('prompt_type', promptType)
    .eq('is_active', true)
    .single()

  return data?.content || null
}

/**
 * Get all versions of a prompt
 */
export async function getPromptVersions(
  supabase: SupabaseClient,
  promptType: string
): Promise<PromptVersion[]> {
  const { data } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('prompt_type', promptType)
    .order('version', { ascending: false })

  if (!data) return []

  return data.map(row => ({
    id: row.id.toString(),
    promptType: row.prompt_type,
    version: row.version,
    content: row.content,
    isActive: row.is_active,
    avgQualityScore: row.avg_quality_score,
    positiveFeedbackRate: row.positive_feedback_rate,
    createdAt: row.created_at
  }))
}

/**
 * Get all prompt types
 */
export async function getAllPromptKeys(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data } = await supabase
    .from('prompt_versions')
    .select('prompt_type')
    .eq('is_active', true)

  if (!data) return []

  const uniqueTypes = new Set(data.map(row => row.prompt_type))
  return Array.from(uniqueTypes).sort()
}

/**
 * Create new prompt version
 */
export async function createPromptVersion(
  supabase: SupabaseClient,
  input: CreatePromptInput
): Promise<PromptVersion> {
  const { promptType, content } = input

  // Get the next version number
  const { data: existing } = await supabase
    .from('prompt_versions')
    .select('version')
    .eq('prompt_type', promptType)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  const nextVersion = (existing?.version || 0) + 1

  // Deactivate all previous versions
  await supabase
    .from('prompt_versions')
    .update({ is_active: false })
    .eq('prompt_type', promptType)

  // Insert new version
  const { data, error } = await supabase
    .from('prompt_versions')
    .insert({
      prompt_type: promptType,
      version: nextVersion,
      content,
      is_active: true
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create prompt version: ${error.message}`)

  return {
    id: data.id.toString(),
    promptType: data.prompt_type,
    version: data.version,
    content: data.content,
    isActive: data.is_active,
    avgQualityScore: data.avg_quality_score,
    positiveFeedbackRate: data.positive_feedback_rate,
    createdAt: data.created_at
  }
}

/**
 * Update active prompt (creates new version)
 */
export async function updatePrompt(
  supabase: SupabaseClient,
  promptType: string,
  input: UpdatePromptInput
): Promise<PromptVersion> {
  return createPromptVersion(supabase, {
    promptType,
    content: input.content
  })
}

/**
 * Activate a specific version
 */
export async function activateVersion(
  supabase: SupabaseClient,
  promptType: string,
  version: number
): Promise<void> {
  // Deactivate all versions
  await supabase
    .from('prompt_versions')
    .update({ is_active: false })
    .eq('prompt_type', promptType)

  // Activate the target version
  const { error } = await supabase
    .from('prompt_versions')
    .update({ is_active: true })
    .eq('prompt_type', promptType)
    .eq('version', version)

  if (error) throw new Error(`Failed to activate version: ${error.message}`)
}

/**
 * Delete a prompt version (soft delete by deactivating)
 */
export async function deletePromptVersion(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('prompt_versions')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw new Error(`Failed to delete version: ${error.message}`)
}

/**
 * Initialize default prompts if they don't exist
 */
export async function initializeDefaultPrompts(
  supabase: SupabaseClient
): Promise<void> {
  const defaultPrompts = [
    {
      promptType: 'analyst-system',
      content: `You are an AI analyst for DevTrends, a developer career intelligence platform. Your role is to provide accurate, insightful, and actionable analysis of technology trends.

# Core Responsibilities

1. **Trend Analysis**: Interpret momentum signals, growth rates, and market indicators
2. **Career Guidance**: Offer practical advice on learning paths and career decisions
3. **Data-Driven Insights**: Base all statements on the provided metrics and signals
4. **Professional Tone**: Write clearly and concisely for developer audiences

# Analysis Guidelines

- **Be specific**: Use exact numbers from the data (e.g., "+30% GitHub stars", "4,200 job postings")
- **Compare contextually**: Show how a technology compares to its category peers
- **Highlight trends**: Identify momentum changes, emerging patterns, and inflection points
- **Stay objective**: Don't overstate or understate; let the data speak
- **Add value**: Explain *why* trends matter for developer careers

# Output Format

Your insights should be:
- 2-3 sentences for single technology insights
- 3-4 sentences for comparisons or deeper analysis
- Structured with clear narrative flow
- Free of jargon unless industry-standard

# Prohibited

- Never invent data points not provided
- Don't make predictions beyond what data supports
- Avoid generic advice ("it depends", "consider your needs")
- No marketing language or hype

Remember: Developers trust you for honest, data-backed insights to make career decisions.`
    },
    {
      promptType: 'comparison-system',
      content: `You are comparing technologies for DevTrends. Provide a fair, balanced analysis that helps developers choose between options.

# Comparison Structure

1. **Key Differences**: Most important distinctions (ecosystem, use case, maturity)
2. **Growth Trajectory**: Which is rising faster and why
3. **Job Market**: Career opportunities and demand for each
4. **Risk Analysis**: What could go wrong with each choice
5. **Learning Investment**: How hard to learn and time to productivity
6. **Market Outlook**: Where each is heading in 1 year
7. **Migration Paths**: Switching difficulty if coming from another tech

# Guidelines

- Be impartial - don't favor one unless data clearly supports it
- Use specific metrics from the data provided
- Consider different developer contexts (junior vs senior, startup vs enterprise)
- Highlight tradeoffs clearly
- Return valid JSON with ALL required fields
- Include optional fields (riskAnalysis, learningCurve, marketOutlook, migrationAdvice) when relevant

Output comprehensive JSON matching the ComparisonInsight schema.`
    },
    {
      promptType: 'digest-system',
      content: `You are generating the weekly DevTrends digest. Synthesize the week's data into compelling, actionable sections.

# Sections to Create

1. **Biggest Mover**: Technology with highest momentum gain and why
2. **Biggest Drop**: Technology losing momentum (if significant)
3. **Category Spotlight**: Interesting pattern within a tech category
4. **Emerging Tech**: New or rapidly accelerating technology
5. **Job Market Signal**: Notable hiring trends
6. **Key Takeaways**: 3-5 bullet points for the week

# Style

- Lead with the most interesting finding
- Use specific numbers to support claims
- Make it scannable (developers are busy)
- End each section with career implications

Keep each section to 2-3 sentences. Total digest should be informative but quick to read.`
    },
    {
      promptType: 'chat-system',
      content: `You are DevTrends Chat, an AI assistant helping developers understand tech trends and make career decisions.

# Your Knowledge

- Access to real-time technology trend data (scores, momentum, job postings)
- Historical context on technology adoption patterns
- Understanding of developer career paths and learning strategies

# Conversation Style

- Friendly but professional
- Direct and concise (developers value their time)
- Data-driven when possible, experienced-based when not
- Ask clarifying questions if the user's intent is unclear

# Capabilities

- Explain trend data and what it means
- Compare technologies for specific use cases
- Suggest learning paths based on career goals
- Provide job market insights

# Limitations

- Cannot predict the future definitively
- Don't have access to internal company data
- Can't provide personalized career coaching (but can offer general guidance)

Always cite data when making claims. If you don't have data, say so and offer informed perspective instead.`
    }
  ]

  for (const prompt of defaultPrompts) {
    // Check if prompt already exists
    const { data: existing } = await supabase
      .from('prompt_versions')
      .select('id')
      .eq('prompt_type', prompt.promptType)
      .limit(1)
      .single()

    if (!existing) {
      await createPromptVersion(supabase, prompt)
    }
  }
}
