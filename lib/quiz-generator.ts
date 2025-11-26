import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

// 验证 quiz 结构
export const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
});

export const QuizSchema = z.array(QuizQuestionSchema);

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;

/**
 * 根据笔记内容生成 3 道多选题
 */
export async function generateQuiz(noteContent: string): Promise<Quiz> {
  try {
    const prompt = `根据以下笔记内容，生成 3 道多选题。每道题有 4 个选项。
    
笔记内容：
${noteContent}

请返回 JSON 格式的数组，每个对象包含：
- question: 问题文本
- options: 4 个选项的数组
- correctAnswer: 正确答案的索引（0-3）

示例格式：
[
  {
    "question": "这是第一个问题吗？",
    "options": ["选项1", "选项2", "选项3", "选项4"],
    "correctAnswer": 0
  }
]

请确保生成的问题内容与笔记相关，难度适中。`;

    const { text } = await generateText({
      model: google('gemini-1.5-flash-002'),
      prompt,
      temperature: 0.7,
    });

    // 从响应中提取 JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const quiz = JSON.parse(jsonMatch[0]);
    return QuizSchema.parse(quiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}
