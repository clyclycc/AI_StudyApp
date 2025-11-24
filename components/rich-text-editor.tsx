// components/rich-text-editor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import { useActionState, useEffect } from 'react'
import { saveNote } from '@/actions/notes' 
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState = {
  message: null,
  errors: {},
  success: false,
};

export default function RichTextEditor() {
  const [state, formAction] = useActionState(saveNote, initialState)
  
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
  })

  useEffect(() => {
    if (state.success) {
      alert(state.message || '保存成功！');
      editor?.commands.clearContent();
      // Reset title if you have a way to do that
    } else if (state.message) {
      alert(state.message);
    }
  }, [state, editor]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;

    const formData = new FormData(event.currentTarget);
    formData.set('content', editor.getHTML());
    
    formAction(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex gap-4">
        <Input 
          name="title"
          placeholder="请输入笔记标题..."
          disabled={false} // You might want to manage pending state here
          className="font-medium"
        />
        <Button type="submit" disabled={false}>
          {'保存笔记'}
        </Button>
      </div>
      
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <EditorContent editor={editor} />
      </div>
    </form>
  )
}
