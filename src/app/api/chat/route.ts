import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, catId, prompt } = await request.json();

    if (!message || !catId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: message, catId, prompt' },
        { status: 400 }
      );
    }

    const apiKey = "sk-iXVMg4qwUdjHYPtN3fBaE77d03C54a11Ab97D8BeB3845d5c";
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 构建对话请求
    const chatRequest = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    };

    // 调用GPT API
    const response = await fetch('https://az.gptplus5.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(chatRequest)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from AI model' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: 'Invalid response from AI model' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: reply.trim(),
      catId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}