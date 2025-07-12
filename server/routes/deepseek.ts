
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

    // Enhanced RAG context retrieval
    let enhancedMessages = [...messages];
    if (ragContext && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        try {
          console.log('🔍 Performing enhanced RAG search for:', lastUserMessage.content);
          
          // Multi-strategy RAG search
          const ragResponse = await fetch(`http://localhost:5000/api/rag/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: lastUserMessage.content,
              limit: 15,
              threshold: 0.2
            })
          });

          if (ragResponse.ok) {
            const ragData = await ragResponse.json();
            console.log(`📚 RAG found ${ragData.results?.length || 0} relevant documents`);
            
            if (ragData.results && ragData.results.length > 0) {
              // Build comprehensive context
              const contextChunks = ragData.results.map((result: any, index: number) => {
                return `[Document ${index + 1}] ${result.metadata?.platform || 'Unknown'}: ${result.content}`;
              }).join('\n\n');

              const contextMessage = {
                role: 'system',
                content: `# Relevant Documentation Context\n\nYou have access to the following indexed documentation and resources:\n\n${contextChunks}\n\n# Instructions\nUse this context to provide accurate, specific answers. Reference specific platforms, features, or documentation when relevant. If the context doesn't contain relevant information, acknowledge this and provide general guidance.`
              };

              enhancedMessages = [contextMessage, ...messages];
              console.log('📖 Added RAG context with', ragData.results.length, 'documents');
            }
          } else {
            console.warn('⚠️ RAG search failed, proceeding without context');
          }
        } catch (ragError) {
          console.error('❌ RAG context error:', ragError);
        }
      }
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: enhancedMessages,
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
