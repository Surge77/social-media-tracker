/**
 * Google Gemini provider.
 *
 * Uses the official @google/generative-ai SDK.
 * Gemini is the only provider that doesn't use OpenAI-compatible API format —
 * it has native JSON schema enforcement via responseMimeType + responseSchema.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, GenerateOptions } from '@/lib/ai/provider'
import { ProviderError } from '@/lib/ai/provider'

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async generateJSON<T>(
    prompt: string,
    schema?: object,
    options?: GenerateOptions
  ): Promise<T> {
    const model = this.client.getGenerativeModel({
      model: options?.model ?? 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        ...(schema ? { responseSchema: schema as never } : {}),
        temperature: options?.temperature ?? 0.3,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
      ...(options?.systemPrompt
        ? { systemInstruction: options.systemPrompt }
        : {}),
    })

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      return JSON.parse(text) as T
    } catch (error) {
      const status = (error as { status?: number })?.status ?? 500
      throw new ProviderError(
        `Gemini error: ${(error as Error).message}`,
        status,
        'gemini'
      )
    }
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    const model = this.client.getGenerativeModel({
      model: options?.model ?? 'gemini-2.0-flash',
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
      ...(options?.systemPrompt
        ? { systemInstruction: options.systemPrompt }
        : {}),
    })

    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      const status = (error as { status?: number })?.status ?? 500
      throw new ProviderError(
        `Gemini error: ${(error as Error).message}`,
        status,
        'gemini'
      )
    }
  }

  async *generateStream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncIterable<string> {
    const model = this.client.getGenerativeModel({
      model: options?.model ?? 'gemini-2.0-flash',
      generationConfig: {
        temperature: options?.temperature ?? 0.4,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
      ...(options?.systemPrompt
        ? { systemInstruction: options.systemPrompt }
        : {}),
    })

    try {
      const result = await model.generateContentStream(prompt)
      for await (const chunk of result.stream) {
        yield chunk.text()
      }
    } catch (error) {
      const status = (error as { status?: number })?.status ?? 500
      throw new ProviderError(
        `Gemini stream error: ${(error as Error).message}`,
        status,
        'gemini'
      )
    }
  }
}
