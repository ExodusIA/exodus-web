// Importações do Firebase
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { differenceInDays } from 'date-fns';
import { db } from "./firebaseConfig.js";

// Função para obter todos os programas
export const getPrograms = async (businessId) => {
  try {
    const businessRef = doc(db, 'businesses', businessId); // Crie uma referência ao documento do negócio
    const programsRef = collection(db, "programs");
    const q = query(programsRef, where("business", "==", businessRef)); // Compare a referência diretamente
    const querySnapshot = await getDocs(q);
    const programsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return programsList;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};

export const getProgramById = async (programId) => {
  try {
    const programDocRef = doc(db, "programs", programId);
    const programDoc = await getDoc(programDocRef);

    if (programDoc.exists()) {
      return { id: programDoc.id, ...programDoc.data() };
    } else {
      throw new Error("Programa não encontrado");
    }
  } catch (e) {
    console.error("Error getting program by ID: ", e);
    throw e;
  }
};
// Função para adicionar um novo programa
export const addProgram = async (programData) => {
  try {
    const businessRef = doc(db, 'businesses', programData.business);

    // Adicione a referência do business ao programData
    const programWithBusinessRef = {
      ...programData,
      business: businessRef
    };

    console.log(programWithBusinessRef);

    const docRef = await addDoc(collection(db, "programs"), programWithBusinessRef);
    
    return { id: docRef.id, ...programWithBusinessRef };
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

//Função para obter tarefas do dia
export const getTaskForToday = async (programId, startDate) => {
  try {
    const programRef = doc(db, "programs", programId);
    const programDoc = await getDoc(programRef);
    if (programDoc.exists()) {
      const tasks = programDoc.data().tasks;
      const currentDay = differenceInDays(new Date(), startDate.toDate()) % 7;
      const todayTask = tasks.find(task => task.day === currentDay);
      return todayTask;
    } else {
      console.log("No such document!");
    }
  } catch (e) {
    console.error("Error getting task for today: ", e);
  }
};