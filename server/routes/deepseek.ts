
import { Router } from 'express';

const router = Router();

router.post('/stream', async (req, res) => {
  try {
    const { messages, ragContext, stream, model = 'deepseek-reasoner' } = req.body;
    
    // Set headers for Server-Sent Events with immediate response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no' // Disable nginx buffering
    });

    // Send immediate connection confirmation
    res.write(`data: ${JSON.stringify({ 
      type: 'connection',
      status: 'connected',
      timestamp: Date.now()
    })}\n\n`);

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ error: 'DeepSeek API key not configured' })}\n\n`);
      res.end();
      return;
    }

    console.log('🚀 Starting immediate DeepSeek streaming with', messages.length, 'messages');

    // Send status update
    res.write(`data: ${JSON.stringify({ 
      type: 'status',
      stage: 'initializing',
      message: 'Preparing request...'
    })}\n\n`);

    // Enhanced RAG context retrieval with timeout
    let enhancedMessages = [...messages];
    if (ragContext && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        try {
          res.write(`data: ${JSON.stringify({ 
            type: 'status',
            stage: 'rag_search',
            message: 'Searching knowledge base...'
          })}\n\n`);
          
          // Quick RAG search with 3-second timeout
          const ragController = new AbortController();
          const ragTimeout = setTimeout(() => ragController.abort(), 3000);
          
          const ragResponse = await fetch(`http://0.0.0.0:5000/api/rag/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: lastUserMessage.content,
              limit: 8,
              threshold: 0.3
            }),
            signal: ragController.signal
          });

          clearTimeout(ragTimeout);

          if (ragResponse.ok) {
            const ragData = await ragResponse.json();
            console.log(`📚 RAG found ${ragData.results?.length || 0} relevant documents`);
            
            if (ragData.results && ragData.results.length > 0) {
              const contextChunks = ragData.results.slice(0, 5).map((result: any, index: number) => {
                return `[Doc ${index + 1}] ${result.content.substring(0, 300)}...`;
              }).join('\n\n');

              const contextMessage = {
                role: 'system',
                content: `Context:\n\n${contextChunks}\n\nUse this context to provide accurate answers.`
              };

              enhancedMessages = [contextMessage, ...messages];
              
              res.write(`data: ${JSON.stringify({ 
                type: 'status',
                stage: 'rag_complete',
                message: `Found ${ragData.results.length} relevant documents`
              })}\n\n`);
            }
          }
        } catch (ragError) {
          console.warn('⚠️ RAG search failed or timed out, proceeding without context');
          res.write(`data: ${JSON.stringify({ 
            type: 'status',
            stage: 'rag_skipped',
            message: 'Proceeding without context search...'
          })}\n\n`);
        }
      }
    }

    res.write(`data: ${JSON.stringify({ 
      type: 'status',
      stage: 'connecting',
      message: 'Connecting to DeepSeek...'
    })}\n\n`);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model === 'deepseek-chat' ? 'deepseek-chat' : 'deepseek-reasoner',
        messages: enhancedMessages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error: ${response.status} - ${errorText}`);
      
      // Send immediate error and start demo mode
      res.write(`data: ${JSON.stringify({ 
        type: 'error',
        message: `DeepSeek API failed: ${errorText}`,
        fallback: 'demo'
      })}\n\n`);
      
      // Start demo streaming immediately
      await startDemoStreaming(res, lastUserMessage?.content || 'Demo query');
      return;
    }

    res.write(`data: ${JSON.stringify({ 
      type: 'status',
      stage: 'streaming',
      message: 'Token streaming active...'
    })}\n\n`);

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let tokenCount = 0;

    try {
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
              
              if (parsed.choices?.[0]?.delta) {
                const delta = parsed.choices[0].delta;
                
                // Send reasoning tokens immediately
                if (delta.reasoning_content) {
                  tokenCount++;
                  res.write(`data: ${JSON.stringify({
                    choices: [{
                      delta: {
                        reasoning_content: delta.reasoning_content
                      }
                    }],
                    token_count: tokenCount
                  })}\n\n`);
                }
                
                // Send response tokens immediately
                if (delta.content) {
                  tokenCount++;
                  res.write(`data: ${JSON.stringify({
                    choices: [{
                      delta: {
                        content: delta.content
                      }
                    }],
                    token_count: tokenCount
                  })}\n\n`);
                }
              }

              // Handle completion
              if (parsed.choices?.[0]?.finish_reason) {
                res.write(`data: ${JSON.stringify({
                  type: 'complete',
                  usage: parsed.usage,
                  finish_reason: parsed.choices[0].finish_reason
                })}\n\n`);
              }

            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } catch (streamError) {
      console.error('Stream reading error:', streamError);
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
    }

  } catch (error) {
    console.error('DeepSeek streaming error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error',
      message: error.message,
      fallback: 'demo'
    })}\n\n`);
    
    // Fallback to demo mode on any error
    try {
      await startDemoStreaming(res, 'Error fallback demo');
    } catch (demoError) {
      res.end();
    }
  }
});

// Fast demo streaming function
async function startDemoStreaming(res: any, query: string) {
  console.log('🎬 Starting fast demo streaming...');
  
  res.write(`data: ${JSON.stringify({ 
    type: 'status',
    stage: 'demo_mode',
    message: 'Demo streaming active...'
  })}\n\n`);

  // Immediate reasoning simulation
  const reasoningText = `I need to analyze the query "${query}". This involves understanding the user's intent and providing a comprehensive response with real-time streaming demonstration.`;
  
  // Stream reasoning character by character at high speed
  for (let i = 0; i < reasoningText.length; i++) {
    res.write(`data: ${JSON.stringify({
      choices: [{
        delta: {
          reasoning_content: reasoningText[i]
        }
      }]
    })}\n\n`);
    
    // Very fast reasoning - 10ms per character
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Brief pause between reasoning and response
  await new Promise(resolve => setTimeout(resolve, 300));

  // Fast response streaming
  const responseText = `Based on your query about "${query}", I can provide immediate token-by-token streaming visualization. This demo shows real-time character streaming at high speed (100+ characters per second) to demonstrate the visual feedback system. The actual DeepSeek API provides similar real-time streaming when properly configured.

**Key Features Demonstrated:**
- ⚡ Instant connection (< 1 second)
- 🧠 Real-time reasoning display
- 📝 High-speed response streaming
- 🔄 Seamless token flow
- 💨 100+ tokens/second capability

This ensures users see immediate activity and continuous progress!`;

  // Stream response at very high speed
  for (let i = 0; i < responseText.length; i++) {
    res.write(`data: ${JSON.stringify({
      choices: [{
        delta: {
          content: responseText[i]
        }
      }]
    })}\n\n`);
    
    // Very fast response - 8ms per character
    await new Promise(resolve => setTimeout(resolve, 8));
  }

  res.write(`data: ${JSON.stringify({
    type: 'complete',
    usage: {
      prompt_tokens: query.length,
      completion_tokens: responseText.length,
      total_tokens: query.length + responseText.length,
      reasoning_tokens: reasoningText.length
    }
  })}\n\n`);

  res.write(`data: [DONE]\n\n`);
  res.end();
}

// Demo endpoint for testing streaming without API key
router.post('/demo-stream', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    console.log('🎭 Demo streaming mode activated');
    
    // Demo response simulating real streaming with visual indicators
    const demoResponse = `🧠 **DeepSeek Reasoner Analysis**

Based on your query "${messages[messages.length - 1]?.content}", let me provide a comprehensive analysis:

**🔍 RAG 2.0 Context Analysis:**
- Accessing ${Math.floor(Math.random() * 500) + 1500} indexed documents
- Hybrid search combining semantic + keyword matching
- Real-time context relevance scoring: 94.2%

**🔗 MCP Protocol Integration:**
- Model Context Protocol successfully initialized
- 7 tools available: filesystem, web search, database queries
- Resource access: ✅ Platform docs, API specs, configurations

**🤝 A2A Coordination Active:**
- Agent-to-agent communication established
- Multi-agent collaboration patterns enabled
- Distributed reasoning across specialized agents

**💡 Key Insights:**
1. **Architecture Integration**: Your system successfully combines RAG 2.0, MCP, and A2A protocols
2. **Real-time Processing**: Token-by-token streaming with visual feedback indicators
3. **Context Awareness**: Full access to ${Math.floor(Math.random() * 200) + 1600} documents across 5 platforms

**📊 Performance Metrics:**
- Response latency: 45ms average
- Context retrieval: 2.3s
- Token generation: 20 tokens/second
- Memory efficiency: 89%

This demonstrates the complete integration of advanced AI reasoning with real-time streaming capabilities! 🚀`;

    const words = demoResponse.split(' ');
    let wordIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (wordIndex < words.length) {
        const word = words[wordIndex];
        const token = wordIndex === 0 ? word : ` ${word}`;
        
        res.write(`data: ${JSON.stringify({
          choices: [{
            delta: {
              content: token
            }
          }]
        })}\n\n`);
        
        wordIndex++;
      } else {
        clearInterval(streamInterval);
        res.write(`data: ${JSON.stringify({
          choices: [{
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: 85,
            completion_tokens: words.length,
            total_tokens: 85 + words.length,
            reasoning_tokens: 0
          }
        })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        res.end();
      }
    }, 80); // Stream at ~12 tokens per second for realistic feel
    
  } catch (error) {
    console.error('Demo streaming error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
