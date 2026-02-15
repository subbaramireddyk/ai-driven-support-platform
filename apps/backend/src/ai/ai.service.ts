import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeTicket(title: string, description: string) {
    try {
      const prompt = `Analyze the following support ticket and provide:
1. Intent classification (access_request, bug_report, question, feature_request)
2. Extract entities (toolchain type, specific resources requested)
3. Determine if this could be self-service
4. Provide a helpful suggestion if self-service is available

Ticket Title: ${title}
Ticket Description: ${description}

Respond in JSON format with: { "intent": "", "entities": {}, "selfServiceAvailable": boolean, "suggestion": "" }`;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      const result = JSON.parse(content || '{}');

      return {
        intent: result.intent || 'question',
        entities: result.entities || {},
        selfServiceAvailable: result.selfServiceAvailable || false,
        suggestion: result.suggestion || null,
        documentationLinks: result.documentationLinks || [],
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        intent: 'question',
        entities: {},
        selfServiceAvailable: false,
        suggestion: null,
        documentationLinks: [],
      };
    }
  }

  async generateResponse(context: string, question: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful DevOps support assistant. Provide clear, concise answers.' },
          { role: 'user', content: `Context: ${context}\n\nQuestion: ${question}` }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('AI Response Error:', error);
      return 'I apologize, but I encountered an error generating a response.';
    }
  }

  async searchKnowledgeBase(query: string, toolchain?: string) {
    // This would integrate with a vector database for semantic search
    // For now, returning a placeholder
    return {
      results: [],
      message: 'Knowledge base search functionality will be integrated with vector embeddings',
    };
  }
}
