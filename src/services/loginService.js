import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const loginUser = async (email, password) => {
  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const getUserBusiness = async (userId) => {
  try {
    const businessRef = doc(db, 'businesses', userId);
    const businessDoc = await getDoc(businessRef);
    if (businessDoc.exists()) {
      return { id: businessDoc.id, ...businessDoc.data() };
    } else {
      throw new Error('No business found for this user');
    }
  } catch (error) {
    console.error('Error fetching business:', error);
    throw error;
  }
};

