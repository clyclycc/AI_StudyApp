"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

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
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        message: "Authentication error.",
        errors: { _server: ["User not authenticated"] },
        success: false,
      };
    }

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

    await prisma.note.create({
      data: {
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        authorId: user.id, // Associate note with the user
      },
    });

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
