const { attachedAssetsMCPService } = require('./server/services/attachedAssetsMcpService.ts');

async function testMCPIntegration() {
  console.log('🔄 Testing MCP Hub Integration...\n');

  try {
    // Test 1: Load assets
    console.log('1. Loading attached assets...');
    const assets = await attachedAssetsMCPService.loadAvailableAssets();
    console.log(`✅ Found ${assets.length} assets`);
    
    // Test 2: Get statistics
    console.log('\n2. Getting asset statistics...');
    const stats = attachedAssetsMCPService.getAssetStatistics();
    console.log(`✅ Total: ${stats.totalAssets} | Categories: ${Object.keys(stats.categories).length} | Types: ${Object.keys(stats.types).length}`);
    console.log('Categories:', Object.keys(stats.categories).join(', '));

    // Test 3: Query for MCP-related content
    console.log('\n3. Querying for MCP content...');
    const mcpQuery = await attachedAssetsMCPService.queryAssets({
      query: "Model Context Protocol MCP architecture implementation",
      maxAssets: 3,
      includeContent: true
    });
    console.log(`✅ Found ${mcpQuery.relevantAssets.length} relevant MCP assets`);
    mcpQuery.relevantAssets.forEach(asset => {
      console.log(`   - ${asset.filename} (${asset.metadata?.category || 'general'}) - Score: ${asset.metadata?.relevanceScore || 0}`);
    });

    // Test 4: Get context for prompt
    console.log('\n4. Testing context generation...');
    const context = await attachedAssetsMCPService.getContextForPrompt("How does MCP protocol work?", 2);
    console.log(`✅ Generated context (${context.length} chars)`);
    console.log('Preview:', context.substring(0, 200) + '...');

    console.log('\n🎉 MCP Hub integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testMCPIntegration();