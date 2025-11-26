import { generateQuiz } from '@/lib/quiz-generator';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { noteId: string } }) {
  try {
    const { noteId } = params;

    // 获取笔记内容
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, content: true },
    });

    if (!note) {
      return new Response(
        JSON.stringify({ error: 'Note not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 生成 quiz
    const quiz = await generateQuiz(note.content);

    return new Response(
      JSON.stringify({ quiz }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Quiz generation error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate quiz',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
