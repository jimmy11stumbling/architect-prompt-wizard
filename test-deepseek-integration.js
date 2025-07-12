import fetch from 'node-fetch';

async function testDeepSeekIntegration() {
  const baseUrl = 'http://localhost:5000/api';
  
  console.log('Testing DeepSeek integration with indexed documents...\n');
  
  try {
    // 1. Check API key
    console.log('1. Checking DeepSeek API key...');
    const keyResponse = await fetch(`${baseUrl}/deepseek/check-api-key`);
    const keyData = await keyResponse.json();
    console.log('API key status:', keyData.hasApiKey ? 'Available' : 'Missing');
    
    // 2. Check RAG stats
    console.log('\n2. Checking RAG document index...');
    const statsResponse = await fetch(`${baseUrl}/rag/stats`);
    const statsData = await statsResponse.json();
    console.log('Documents indexed:', statsData.documentsIndexed);
    console.log('Vector store size:', statsData.vectorStoreStats.indexSize);
    
    // 3. Test RAG search
    console.log('\n3. Testing RAG search for MCP...');
    const ragResponse = await fetch(`${baseUrl}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Model Context Protocol MCP', limit: 3 })
    });
    const ragData = await ragResponse.json();
    console.log('RAG search results:', ragData.results?.length || 0);
    
    // 4. Test DeepSeek with document context
    console.log('\n4. Testing DeepSeek with document context...');
    const deepseekResponse = await fetch(`${baseUrl}/deepseek/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'What is Model Context Protocol (MCP) and how does it work?' }
        ],
        ragContext: true
      })
    });
    
    if (deepseekResponse.ok) {
      const deepseekData = await deepseekResponse.json();
      console.log('DeepSeek response received!');
      console.log('Content length:', deepseekData.choices?.[0]?.message?.content?.length || 0);
      console.log('First 200 chars:', deepseekData.choices?.[0]?.message?.content?.substring(0, 200) || 'No content');
    } else {
      const errorText = await deepseekResponse.text();
      console.log('DeepSeek API error:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testDeepSeekIntegration();