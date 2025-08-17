console.log('🧪 Running Username System Tests...'); 
import('/src/utils/testUsername.js').then(module => {
  module.runUsernameTests().then(results => {
    console.log('Test Results:', results);
    console.log('Firebase Test:', results.firebaseTest ? '✅ PASS' : '❌ FAIL');
    console.log('LocalStorage Test:', results.localStorageTest ? '✅ PASS' : '❌ FAIL');
  });
}).catch(err => console.error('Test failed:', err));
