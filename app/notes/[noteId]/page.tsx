'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader, Brain, Edit2 } from 'lucide-react';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/notes?noteId=${noteId}`);

        if (!response.ok) {
          throw new Error('Failed to load note');
        }

        const data = await response.json();
        setNote(data.note || null);
      } catch (err) {
        console.error('Error loading note:', err);
        setError(err instanceof Error ? err.message : 'Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">加载笔记中...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{error || '笔记未找到'}</p>
          <Link href="/notes">
            <Button className="bg-blue-600 hover:bg-blue-700">返回笔记列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>

          <div className="flex gap-2">
            <Link href={`/quiz/${note.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                生成测验
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Title */}
          <div className="p-8 border-b border-slate-200">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{note.title}</h1>
            <p className="text-slate-500">
              创建于 {new Date(note.createdAt).toLocaleString('zh-CN')}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>

          {/* Actions */}
          <div className="p-8 bg-slate-50 border-t border-slate-200 flex gap-4">
            <Link href={`/notes/${note.id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                编辑
              </Button>
            </Link>

            <Link href="/chat">
              <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                提问关于此笔记
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
