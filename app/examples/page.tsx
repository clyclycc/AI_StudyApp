"use server"

import type { FormEvent } from 'react'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

const EmailSchema = z.object({
  email: z.string().email(),
})

type EmailForm = z.infer<typeof EmailSchema>

export default function ExamplePage() {
  async function submit(formData: FormData) {
    'use server'
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>
    const parsed = EmailSchema.safeParse(raw)
    if (!parsed.success) {
      // In a real app, surface errors to the UI; server actions can return structured errors
      throw new Error('Invalid email')
    }

    const values: EmailForm = parsed.data

    const { error } = await supabase.from('subscribers').insert([{ email: values.email }])
    if (error) throw error
  return
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <form action={submit} className="flex gap-2">
        <Input name="email" type="email" placeholder="you@example.com" />
        <Button type="submit">
          <Mail className="mr-2" />
          Subscribe
        </Button>
      </form>
    </div>
  )
}
