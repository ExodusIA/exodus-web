// Importações do Firebase
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

// Função para obter todas as tarefas de um programa específico
export const getProgramTasks = async (programId) => {
  try {
    const querySnapshot = await getDocs(collection(db, "programs", programId, "tasks"));
    const tasksList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return tasksList;
  } catch (e) {
    console.error("Error getting documents: ", e);
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

// Função para adicionar uma tarefa a um programa
export const addProgramTask = async (programId, taskData) => {
  try {
    const { taskName, taskDescription, day } = taskData;
    const docRef = await addDoc(collection(db, "programs", programId, "tasks"), { taskName, taskDescription, day });
    return { id: docRef.id, taskName, taskDescription, day };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Função para atualizar uma tarefa de um programa
export const updateProgramTask = async (programId, taskId, taskData) => {
  try {
    const { taskName, taskDescription, day } = taskData;
    const taskDoc = doc(db, "programs", programId, "tasks", taskId);
    await updateDoc(taskDoc, { taskName, taskDescription, day });
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};

// Função para deletar uma tarefa de um programa
export const deleteProgramTask = async (programId, taskId) => {
  try {
    await deleteDoc(doc(db, "programs", programId, "tasks", taskId));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};
