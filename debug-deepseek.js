import fetch from 'node-fetch';

async function debugDeepSeek() {
  console.log('=== DeepSeek Debug Session ===\n');
  
  try {
    // 1. Test simple API call
    console.log('1. Testing minimal DeepSeek API call...');
    const response = await fetch('http://localhost:5000/api/deepseek/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      }),
      timeout: 5000
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data keys:', Object.keys(data));
      console.log('Message content length:', data.choices?.[0]?.message?.content?.length || 0);
      console.log('First 100 chars:', data.choices?.[0]?.message?.content?.substring(0, 100) || 'No content');
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  }
}

debugDeepSeek();