// Direct test of DeepSeek API without server middleware
import fetch from 'node-fetch';

async function testDeepSeekDirect() {
  console.log('=== Testing DeepSeek API Direct Call ===\n');

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DEEPSEEK_API_KEY environment variable not set');
    return;
  }

  console.log('API Key found:', apiKey.substring(0, 8) + '...');

  try {
    console.log('Making direct call to DeepSeek API...');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          { role: 'user', content: 'What is 2+2?' }
        ],
        max_tokens: 100,
        temperature: 0.1
      }),
      timeout: 10000
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    if (response.ok) {
      const data = await response.json();
      console.log('Response successful!');
      console.log('Model:', data.model);
      console.log('Content:', data.choices?.[0]?.message?.content);
      console.log('Usage:', data.usage);
    } else {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
    }

  } catch (error) {
    console.error('Request failed:', error.message);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
  }
}

testDeepSeekDirect();