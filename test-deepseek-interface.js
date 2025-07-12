// Test DeepSeek Interface
const fetch = require('node-fetch');

async function testDeepSeekInterface() {
  console.log('Testing DeepSeek Interface...');
  
  try {
    const response = await fetch('http://localhost:5000/api/deepseek/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'What is the capital of France?' }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ DeepSeek API Response Structure:');
    console.log({
      hasChoices: !!data.choices,
      hasMessage: !!data.choices?.[0]?.message,
      contentLength: data.choices?.[0]?.message?.content?.length || 0,
      reasoningLength: data.choices?.[0]?.message?.reasoning_content?.length || 0,
      usage: data.usage
    });
    
    if (data.choices?.[0]?.message?.content) {
      console.log('✅ Response content received:', data.choices[0].message.content.substring(0, 100) + '...');
    }
    
    if (data.choices?.[0]?.message?.reasoning_content) {
      console.log('✅ Reasoning content received:', data.choices[0].message.reasoning_content.substring(0, 100) + '...');
    }
    
    console.log('✅ DeepSeek interface working correctly!');
    
  } catch (error) {
    console.error('❌ DeepSeek interface test failed:', error.message);
  }
}

testDeepSeekInterface();