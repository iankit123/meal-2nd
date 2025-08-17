// Quick test to verify all systems work
export const quickSystemTest = async () => {
  console.log('🚀 Quick System Test Started');
  
  // Test 1: Server API
  try {
    const testUser = `test${Math.random().toString(36).substr(2, 6)}`;
    console.log(`Testing server with username: ${testUser}`);
    
    const response = await fetch('/api/usernames', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUser })
    });
    
    if (response.ok) {
      console.log('✅ Server API: WORKING');
      return { server: true, message: 'Server API working correctly' };
    } else {
      const error = await response.json();
      console.log('❌ Server API Error:', error);
      return { server: false, message: `Server error: ${error.error}` };
    }
  } catch (error) {
    console.log('❌ Server API Failed:', error);
    return { server: false, message: 'Server connection failed' };
  }
};