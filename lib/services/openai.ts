import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable browser usage
});

export interface SummaryResponse {
  summary: string;
  error?: string;
}

export async function summarizeNote(content: string): Promise<SummaryResponse> {
  try {
    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, type: 'note' }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      summary: data.summary
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      summary: "Failed to generate summary",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function summarizeDashboard(notes: Array<{ title: string; content: string }>): Promise<SummaryResponse> {
  try {
    const combinedContent = notes
      .map(note => `Title: ${note.title}\nContent: ${note.content}`)
      .join('\n\n');

    const response = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content: combinedContent,
        type: 'dashboard'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      summary: data.summary
    };
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    return {
      summary: "Failed to generate summary",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
} 