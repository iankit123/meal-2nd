import { auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface TestResults {
  serverTest: boolean;
  firebaseTest: boolean;
  localStorageTest: boolean;
}

export const runUsernameTests = async (): Promise<TestResults> => {
  console.log('🧪 Starting Comprehensive Username System Test');
  
  let serverTest = false;
  let firebaseTest = false;
  let localStorageTest = false;
  
  try {
    // Check if auth is initialized
    if (!auth.currentUser) {
      console.log('❌ Auth not initialized');
      return { serverTest: false, firebaseTest: false, localStorageTest: false };
    }
    
    console.log('✅ Auth initialized, User ID:', auth.currentUser.uid);
    
    // Test 1: Server API username storage
    const testUsername = `servertest${Date.now()}`;
    console.log('🔄 Testing server API username creation:', testUsername);
    
    try {
      // Create username via server API
      const createResponse = await fetch('/api/usernames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: testUsername }),
      });

      if (createResponse.ok) {
        console.log('✅ Server username creation successful');
        
        // Verify by checking if it exists
        const checkResponse = await fetch(`/api/usernames/${testUsername}`);
        if (checkResponse.ok) {
          const data = await checkResponse.json();
          if (data.exists) {
            serverTest = true;
            console.log('✅ Server username verification successful');
          } else {
            console.log('❌ Server username not found after creation');
          }
        }
      } else {
        const errorData = await createResponse.json();
        console.log('❌ Server API failed:', errorData.error);
      }
    } catch (error) {
      console.log('❌ Server test failed with error:', error);
    }
    
    console.log('Test 1 result:', serverTest ? '✅ PASSED' : '❌ FAILED');
    
    // Test 2: Firebase username storage
    const firebaseTestUsername = `firebasetest${Date.now()}`;
    console.log('🔄 Testing Firebase username creation:', firebaseTestUsername);
    
    try {
      // Try to check if username exists
      const usernameDoc = await getDoc(doc(db, 'usernames', firebaseTestUsername));
      console.log('📖 Username exists check:', usernameDoc.exists());
      
      // Try to create username document
      await setDoc(doc(db, 'usernames', firebaseTestUsername), {
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        testData: true,
      });
      
      // Verify creation
      const verifyDoc = await getDoc(doc(db, 'usernames', firebaseTestUsername));
      if (verifyDoc.exists()) {
        console.log('✅ Firebase username storage successful');
        firebaseTest = true;
      } else {
        console.log('❌ Firebase username not found after creation');
      }
    } catch (error) {
      console.log('❌ Firebase test failed with error:', error);
    }
    
    console.log('Test 2 result:', firebaseTest ? '✅ PASSED' : '❌ FAILED');
    
    // Test 3: LocalStorage fallback
    console.log('🔄 Testing localStorage fallback...');
    try {
      // Add test usernames to localStorage
      const testUsernames = ['testlocal1', 'testlocal2'];
      localStorage.setItem('mealplanner-usernames', JSON.stringify(testUsernames));
      
      // Retrieve and verify
      const stored = JSON.parse(localStorage.getItem('mealplanner-usernames') || '[]');
      console.log('Local usernames:', stored);
      
      if (stored.length >= 2) {
        localStorageTest = true;
      }
    } catch (error) {
      console.log('❌ LocalStorage test failed:', error);
    }
    
    console.log('Test 3 result:', localStorageTest ? '✅ PASSED' : '❌ FAILED');
    
  } catch (error) {
    console.log('❌ Test initialization failed:', error);
  }
  
  return { serverTest, firebaseTest, localStorageTest };
};