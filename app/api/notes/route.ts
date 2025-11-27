// app/api/notes/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

// ---------------------------------------------------------
// 1. GET 方法：获取笔记 (对应你提供的读取逻辑)
// 使用方式：fetch('/api/notes?userId=xxx') 或 fetch('/api/notes?noteId=xxx')
// ---------------------------------------------------------
export async function GET(req: Request) {
  try {
    // GET 请求从 URL 参数 (searchParams) 获取数据，而不是 req.json()
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const noteId = searchParams.get('noteId');

    console.log('Notes GET API called with:', { userId, noteId });

    // 情况 A: 获取单个笔记
    if (noteId) {
      const note = await prisma.note.findUnique({
        where: { id: noteId },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
      });

      if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }

      return NextResponse.json({ note });
    }

    // 情况 B: 获取用户的所有笔记
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const notes = await prisma.note.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes });

  } catch (error) {
    console.error('GET /api/notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// 2. POST 方法：保存笔记 (Create)
// 修复了之前的 "TypeError: Cannot read properties of undefined"
// ---------------------------------------------------------
const NoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content cannot be empty'),
});

export async function POST(req: Request) {
  try {
    // 🔴 关键修复：createClient 是异步的，必须加 await
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    // 如果你是本地测试且没登录，可以暂时注释掉这块验证
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = NoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    // 确保用户存在
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email },
      create: {
        id: user.id,
        email: user.email!,
      },
    });

    // 创建笔记
    const note = await prisma.note.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        authorId: user.id,
      },
    });

    return NextResponse.json({ note });
  } catch (err) {
    console.error('Error creating note:', err);
    const message = err instanceof Error ? err.message : 'An unknown error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}