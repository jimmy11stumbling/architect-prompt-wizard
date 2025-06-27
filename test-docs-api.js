// Test script to verify the agent documentation API
const testApi = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/agent-documentation', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response received successfully!');
    console.log('Platforms:', data.platforms?.length || 0);
    console.log('Knowledge Base entries:', data.knowledgeBase?.length || 0);
    console.log('Technologies included:', Object.keys(data.technologies || {}));
    
    if (data.platforms && data.platforms.length > 0) {
      console.log('First platform:', data.platforms[0].name);
      console.log('Platform features:', data.platforms[0].features?.length || 0);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return null;
  }
};

testApi();