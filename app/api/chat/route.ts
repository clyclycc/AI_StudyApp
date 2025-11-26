import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import prisma from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { question, userId } = await req.json();

    if (!question || typeof question !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Question is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: 获取用户的所有笔记
    const allNotes = await prisma.note.findMany({
      where: { authorId: userId },
      select: { id: true, title: true, content: true },
      take: 5,
    });

    // Step 2: 构造上下文
    const context = allNotes
      .map(
        (note, idx) =>
          `笔记 ${idx + 1}: "${note.title}"\n${note.content}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = `你是一个有帮助的学习助手。根据用户的笔记，回答他们的问题。
    
用户的笔记：
${context || '（暂无相关笔记）'}

请根据这些笔记内容回答用户的问题。如果笔记中没有相关信息，请说明这一点。`;

    // Step 3: 使用 Gemini 1.5 Flash 002 生成流式响应
    const result = streamText({
      model: google('gemini-1.5-flash-002'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
