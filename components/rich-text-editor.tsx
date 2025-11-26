// components/rich-text-editor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import { useActionState, useEffect, startTransition, useState } from 'react'
import { saveNote } from '@/actions/notes' 
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Brain } from 'lucide-react'
import Link from 'next/link'


const initialState = {
  message: null,
  errors: {},
  success: false,
};

export default function RichTextEditor() {
  const [state, formAction] = useActionState(saveNote, initialState)
  const [lastNoteId, setLastNoteId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Bold,
      Italic,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
    immediatelyRender: false, // 之前加的，保持不动
  })

  useEffect(() => {
    if (state.success) {
      // 如果你装了 sonner 就用 toast，没装就用 alert
      // toast.success(state.message || '保存成功！');
      alert(state.message || '保存成功！');
      editor?.commands.clearContent();
      // Generate a mock note ID for demo purposes (in production, this would come from the server)
      setLastNoteId(Math.random().toString(36).substr(2, 9))
    } else if (state.message) {
      // toast.error(state.message);
      alert(state.message);
    }
  }, [state, editor]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;

    const formData = new FormData(event.currentTarget);
    formData.set('content', editor.getHTML());
    
    // 2. 修复核心错误：包裹在 startTransition 中
    setIsSaving(true)
    startTransition(() => {
      formAction(formData);
      setIsSaving(false)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex gap-4">
        <Input 
          name="title"
          placeholder="请输入笔记标题..."
          // 可以选择在 pending 时禁用
          // disabled={isPending} 
          className="font-medium"
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? '保存中...' : '保存笔记'}
        </Button>
      </div>
      
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <EditorContent editor={editor} />
      </div>

      {/* AI Brain Features */}
      <div className="flex gap-2 pt-2 border-t">
        <Link href="/chat">
          <Button 
            type="button"
            variant="outline"
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            提问 AI
          </Button>
        </Link>
        {lastNoteId && (
          <Link href={`/quiz/${lastNoteId}`}>
            <Button 
              type="button"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              生成测验
            </Button>
          </Link>
        )}
      </div>
    </form>
  )
}