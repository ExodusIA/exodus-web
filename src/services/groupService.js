import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

// Função para obter os grupos de um cliente
export const getClientGroups = async (groupRefs) => {
  try {
    const groups = await Promise.all(groupRefs.map(async (groupRef) => {
      const groupDoc = await getDoc(groupRef);
      return { id: groupDoc.id, ...groupDoc.data() };
    }));
    return groups;
  } catch (e) {
    console.error("Error getting groups: ", e);
    throw e;
  }
};

// Função para obter todos os grupos de um negócio específico
export const getGroups = async (businessId) => {
    try {
      const businessRef = doc(db, 'businesses', businessId); // Crie uma referência ao documento do negócio
      const groupsRef = collection(db, "groups");
      const q = query(groupsRef, where("business", "==", businessRef)); // Compare a referência diretamente
      const querySnapshot = await getDocs(q);
      const groupsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return groupsList;
    } catch (e) {
      console.error("Error getting groups: ", e);
      throw e;
    }
  };