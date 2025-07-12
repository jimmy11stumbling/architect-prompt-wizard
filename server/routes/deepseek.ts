
import { Router } from 'express';

const router = Router();

router.post('/stream', async (req, res) => {
  try {
    const { messages, ragContext, stream } = req.body;
    
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ error: 'DeepSeek API key not configured' })}\n\n`);
      res.end();
      return;
    }

    // Start reasoning phase
    res.write(`data: ${JSON.stringify({ phase: 'reasoning' })}\n\n`);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages,
        stream: true,
        max_tokens: 8192,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let reasoningComplete = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            res.write(`data: [DONE]\n\n`);
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            
            // Check if we're transitioning from reasoning to response
            if (parsed.choices?.[0]?.delta?.content && !reasoningComplete) {
              // Look for reasoning content vs response content
              const content = parsed.choices[0].delta.content;
              
              // Simple heuristic: if we see structured response patterns, switch to response phase
              if (content.includes('\n\n') && content.length > 50 && !reasoningComplete) {
                reasoningComplete = true;
                res.write(`data: ${JSON.stringify({ phase: 'response' })}\n\n`);
              }
            }

            // Forward the streaming data
            res.write(`data: ${data}\n\n`);

            // Send usage info if available
            if (parsed.usage) {
              res.write(`data: ${JSON.stringify({ usage: parsed.usage })}\n\n`);
            }

          } catch (e) {
            console.warn('Failed to parse streaming data:', e);
          }
        }
      }
    }

  } catch (error) {
    console.error('DeepSeek streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
