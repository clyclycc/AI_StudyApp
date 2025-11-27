'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Trash2, FileText, Brain } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 这里的 ID 必须和你 actions/notes.ts 以及 chat/page.tsx 里用的保持一致
  const userId = '081e3f3d-8888-4252-b747-2635c4013ed7';

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        // 🔴 修复点：改为 GET 请求，使用查询参数传递 userId
        const response = await fetch(`/api/notes?userId=${userId}`, {
          method: 'GET',
          // GET 请求不需要 body
        });

        if (!response.ok) {
          throw new Error('Failed to load notes');
        }

        const data = await response.json();
        // 确保后端返回的是 { notes: [...] } 结构
        setNotes(data.notes || []);
      } catch (err) {
        console.error('Error loading notes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('确定要删除这条笔记吗？')) return;

    try {
      // 注意：这需要后端支持 DELETE 方法 (可能需要新建 app/api/notes/[noteId]/route.ts)
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('删除失败: 需确认后端API已实现 DELETE 方法');
    }
  };

  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">加载笔记中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">我的笔记</h1>
          </div>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新建笔记
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg mb-4">暂无笔记</p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">开始创建笔记</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 line-clamp-2">
                    {note.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1">
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {stripHtml(note.content)}
                  </p>
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
                  <Link href={`/quiz/${note.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <Brain className="w-4 h-4" />
                      生成测验
                    </Button>
                  </Link>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
