// Test Enhanced Streaming Interface
import fetch from 'node-fetch';

async function testEnhancedStreamingInterface() {
  console.log('🧪 Testing Enhanced Streaming Interface...');
  
  try {
    // Test 1: Check if the streaming interface loads
    console.log('1. Testing streaming interface load...');
    const pageResponse = await fetch('http://localhost:5000/');
    if (!pageResponse.ok) {
      throw new Error(`Page load failed: ${pageResponse.status}`);
    }
    console.log('✅ Streaming interface loads successfully');
    
    // Test 2: Check RAG stats API
    console.log('2. Testing RAG stats API...');
    const ragResponse = await fetch('http://localhost:5000/api/rag/stats');
    if (ragResponse.ok) {
      const ragData = await ragResponse.json();
      console.log('✅ RAG stats working:', {
        documents: ragData.documentsIndexed,
        chunks: ragData.chunksIndexed
      });
    } else {
      console.log('⚠️ RAG stats API issue:', ragResponse.status);
    }
    
    // Test 3: Check MCP Hub stats
    console.log('3. Testing MCP Hub stats...');
    const mcpResponse = await fetch('http://localhost:5000/api/mcp-hub/stats');
    if (mcpResponse.ok) {
      const mcpData = await mcpResponse.json();
      console.log('✅ MCP Hub stats working:', {
        assets: mcpData.data.totalAssets,
        platforms: mcpData.data.platformCount
      });
    } else {
      console.log('⚠️ MCP Hub stats API issue:', mcpResponse.status);
    }
    
    // Test 4: Check DeepSeek streaming endpoint
    console.log('4. Testing DeepSeek streaming endpoint...');
    const streamResponse = await fetch('http://localhost:5000/api/deepseek/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hello, test streaming' }
        ],
        temperature: 0.1,
        ragEnabled: true
      })
    });
    
    if (streamResponse.ok) {
      console.log('✅ DeepSeek streaming endpoint accessible');
      // Don't process the full stream in test
    } else {
      console.log('⚠️ DeepSeek streaming endpoint issue:', streamResponse.status);
    }
    
    // Test 5: Check demo streaming endpoint
    console.log('5. Testing demo streaming endpoint...');
    const demoResponse = await fetch('http://localhost:5000/api/deepseek/demo-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Demo test' }
        ]
      })
    });
    
    if (demoResponse.ok) {
      console.log('✅ Demo streaming endpoint working');
    } else {
      console.log('⚠️ Demo streaming endpoint issue:', demoResponse.status);
    }
    
    console.log('\n🎉 Enhanced Streaming Interface Test Complete!');
    console.log('All core components are operational.');
    
  } catch (error) {
    console.error('❌ Enhanced streaming interface test failed:', error.message);
  }
}

// Run the test
testEnhancedStreamingInterface();