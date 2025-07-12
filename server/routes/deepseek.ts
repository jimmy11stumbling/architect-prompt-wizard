
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

    console.log('Making DeepSeek streaming API call with', messages.length, 'messages');

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
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let isInReasoningPhase = true;

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
            
            // Handle both reasoning and response content
            if (parsed.choices?.[0]?.delta) {
              const delta = parsed.choices[0].delta;
              
              // Check for reasoning content
              if (delta.reasoning_content) {
                console.log('Sending reasoning token:', delta.reasoning_content);
                res.write(`data: ${JSON.stringify({
                  choices: [{
                    delta: {
                      reasoning_content: delta.reasoning_content
                    }
                  }]
                })}\n\n`);
              }
              
              // Check for response content
              if (delta.content) {
                console.log('Sending response token:', delta.content);
                res.write(`data: ${JSON.stringify({
                  choices: [{
                    delta: {
                      content: delta.content
                    }
                  }]
                })}\n\n`);
              }
            }

            // Send usage info if available
            if (parsed.usage) {
              res.write(`data: ${JSON.stringify({ usage: parsed.usage })}\n\n`);
            }

            // Send processing time if available
            if (parsed.processingTime) {
              res.write(`data: ${JSON.stringify({ processingTime: parsed.processingTime })}\n\n`);
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
