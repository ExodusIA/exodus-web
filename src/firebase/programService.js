// Importações do Firebase
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Função para obter todos os programas
export const getPrograms = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "programs"));
    const programsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return programsList;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};

// Função para adicionar um novo programa
export const addProgram = async (programData) => {
  try {
    const docRef = await addDoc(collection(db, "programs"), programData);
    return { id: docRef.id, ...programData };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Função para atualizar um programa existente
export const updateProgram = async (programId, programData) => {
  try {
    const programDoc = doc(db, "programs", programId);
    await updateDoc(programDoc, programData);
  } catch (e) {
    console.error("Error updating program: ", e);
    throw e;
  }
};

// Função para deletar um programa
export const deleteProgram = async (programId) => {
  try {
    await deleteDoc(doc(db, "programs", programId));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

// Função para obter o último dia de tarefa de um programa
export const getProgramLastTaskDay = async (programId) => {
  try {
    const tasksSnapshot = await getDocs(collection(db, "programs", programId, "tasks"));
    const tasks = tasksSnapshot.docs.map(doc => doc.data());
    const lastTaskDay = Math.max(...tasks.map(task => task.day), 0);
    return lastTaskDay;
  } catch (e) {
    console.error("Error getting tasks: ", e);
    return 0;
  }
};