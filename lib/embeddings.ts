import { google } from '@ai-sdk/google';
import { embed } from 'ai';

/**
 * 使用 Google Gemini 的 embedding 模型生成笔记内容的向量表示
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: text,
    });

    if (!embedding || embedding.length === 0) {
      throw new Error('No embedding returned from Google Gemini');
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}
