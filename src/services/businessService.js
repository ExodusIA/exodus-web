// Importações do Firebase
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

// Função para adicionar um negócio
export const addBusiness = async (userId, businessData) => {
  try {
    const businessDocRef = doc(db, "businesses", userId);
    console.log(businessData)
    await setDoc(businessDocRef, businessData);
    return { id: businessDocRef.id, ...businessData };
  } catch (e) {
    console.error("Error adding business: ", e);
    throw e;
  }
};

// Função para obter um negócio pelo ID do usuário
export const getBusiness = async (userId) => {
  try {
    const businessDoc = await getDoc(doc(db, "businesses", userId));
    if (businessDoc.exists()) {
      return { id: businessDoc.id, ...businessDoc.data() };
    } else {
      console.error("No such business!");
      return null;
    }
  } catch (e) {
    console.error("Error getting business: ", e);
    throw e;
  }
};

// Função para atualizar dados de um negócio
export const updateBusiness = async (userId, businessData) => {
  try {
    const businessDoc = doc(db, "businesses", userId);
    await updateDoc(businessDoc, businessData);
  } catch (e) {
    console.error("Error updating business: ", e);
    throw e;
  }
};

// Função para deletar um negócio
export const deleteBusiness = async (userId) => {
  try {
    await deleteDoc(doc(db, "businesses", userId));
  } catch (e) {
    console.error("Error deleting business: ", e);
    throw e;
  }
};

// Função para obter todos os negócios
export const getAllBusinesses = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "businesses"));
    const businessList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return businessList;
  } catch (e) {
    console.error("Error getting businesses: ", e);
    throw e;
  }
};
