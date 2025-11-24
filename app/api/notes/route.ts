import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

const NoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content cannot be empty'),
});

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = NoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    // Ensure a user record exists in our public User table
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email },
      create: {
        id: user.id,
        email: user.email!,
      },
    });

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
