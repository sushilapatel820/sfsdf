import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side environment variable
});

export async function POST(request: Request) {
  try {
    const { content, type } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    let messages: ChatCompletionMessageParam[];
    if (type === 'dashboard') {
      messages = [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries of multiple notes. Focus on key themes and patterns."
        },
        {
          role: "user",
          content: `Please provide a brief overview of these notes, highlighting main themes and key points:\n\n${content}`
        }
      ];
    } else {
      messages = [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries of notes. Keep summaries clear and to the point."
        },
        {
          role: "user",
          content: `Please summarize the following note in 2-3 sentences:\n\n${content}`
        }
      ];
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: type === 'dashboard' ? 250 : 150,
    });

    return NextResponse.json({
      summary: response.choices[0].message.content || "Unable to generate summary"
    });
  } catch (error) {
    console.error('Error in AI summary route:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
} 