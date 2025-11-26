"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { generateEmbedding } from "@/lib/embeddings";

// The state from useActionState
type ActionState = {
  message: string | null;
  errors?: {
    title?: string[];
    content?: string[];
    _server?: string[];
  };
  success: boolean;
};


const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  // The content from Tiptap can be an empty paragraph "<p></p>", so we check for that too.
  content: z.string().min(1, "Content is required").refine(val => val !== '<p></p>', { message: "Content cannot be empty" }),
});


export async function saveNote(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    
    // const supabase = await createClient();

    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();

    // if (!user) {
    //   return {
    //     message: "Authentication error.",
    //     errors: { _server: ["User not authenticated"] },
    //     success: false,
    //   };
    // }

    // 2. 【新增】伪造一个开发者用户 (用于本地测试)
    const user = {
      id: "081e3f3d-8888-4252-b747-2635c4013ed7", // 固定的测试 ID
      email: "dev@localhost",
    };

    const validatedFields = noteSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
    });

    if (!validatedFields.success) {
      return {
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }
    
    // Check if the user from Supabase auth exists in our DB, if not, create them.
    // This is a common pattern for syncing an auth provider with a local user table.
    await prisma.user.upsert({
        where: { id: user.id },
        update: { email: user.email }, // maybe update email if it changed
        create: {
            id: user.id,
            email: user.email!,
        },
    });

    // Generate embedding for the note content
    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(validatedFields.data.content);
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      // Continue without embedding if generation fails
    }

    const note = await prisma.note.create({
      data: {
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        authorId: user.id, // Associate note with the user
      },
    });

    // Update embedding using raw SQL if available
    if (embedding) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "Note" SET embedding = $1::vector WHERE id = $2`,
          JSON.stringify(embedding),
          note.id
        );
      } catch (error) {
        console.error("Failed to update embedding:", error);
      }
    }

    revalidatePath("/"); // Revalidate the page to show the new note
    return { message: "Note saved successfully.", success: true, errors: {} };

  } catch (error) {
    console.error("Failed to save note:", error);
    return {
      message: "Failed to save note to the database.",
      errors: { _server: ["An unexpected error occurred."] },
      success: false,
    };
  }
}
