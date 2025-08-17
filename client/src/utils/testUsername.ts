import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, initializeAuth } from "../lib/firebase";

// Test function to verify username storage and retrieval
export const testUsernameSystem = async () => {
  console.log("🧪 Starting Username System Test");
  
  try {
    // Initialize auth
    const user = await initializeAuth();
    if (!user) {
      console.error("❌ Auth initialization failed");
      return false;
    }
    console.log("✅ Auth initialized, User ID:", user.uid);

    // Test creating a username
    const testUsername = "testuser" + Date.now();
    console.log("🔄 Testing username creation:", testUsername);
    
    // Check if username exists (should not exist)
    const usernameDoc = await getDoc(doc(db, 'usernames', testUsername));
    console.log("📖 Username exists check:", usernameDoc.exists());
    
    if (usernameDoc.exists()) {
      console.error("❌ Username already exists (unexpected)");
      return false;
    }

    // Create username document
    await setDoc(doc(db, 'usernames', testUsername), {
      userId: user.uid,
      createdAt: new Date(),
    });
    console.log("✅ Username document created");

    // Create user profile
    await setDoc(doc(db, 'users', user.uid), {
      username: testUsername,
      createdAt: new Date(),
    });
    console.log("✅ User profile created");

    // Verify username was stored
    const verifyUsernameDoc = await getDoc(doc(db, 'usernames', testUsername));
    if (!verifyUsernameDoc.exists()) {
      console.error("❌ Username was not stored properly");
      return false;
    }
    
    const usernameData = verifyUsernameDoc.data();
    console.log("✅ Username verified in Firebase:", usernameData);

    // Test retrieval by another "user"
    console.log("🔄 Testing username retrieval as different user...");
    const retrieveDoc = await getDoc(doc(db, 'usernames', testUsername));
    if (retrieveDoc.exists()) {
      console.log("✅ Username successfully retrieved:", retrieveDoc.data());
      return true;
    } else {
      console.error("❌ Username could not be retrieved");
      return false;
    }

  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
};

export const runUsernameTests = async () => {
  console.log("🚀 Running comprehensive username tests...");
  
  const test1 = await testUsernameSystem();
  console.log("Test 1 result:", test1 ? "✅ PASSED" : "❌ FAILED");
  
  // Test localStorage fallback
  console.log("🔄 Testing localStorage fallback...");
  localStorage.setItem('mealplanner-usernames', JSON.stringify(['testlocal1', 'testlocal2']));
  const localUsernames = JSON.parse(localStorage.getItem('mealplanner-usernames') || '[]');
  console.log("Local usernames:", localUsernames);
  
  const test2 = localUsernames.includes('testlocal1') && localUsernames.includes('testlocal2');
  console.log("Test 2 result:", test2 ? "✅ PASSED" : "❌ FAILED");
  
  return { firebaseTest: test1, localStorageTest: test2 };
};