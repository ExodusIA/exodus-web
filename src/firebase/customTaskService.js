// Importações do Firebase
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Função para adicionar uma tarefa personalizada a um programa de cliente
export const addCustomTask = async (clientId, programId, taskData) => {
  try {
    const customTaskRef = collection(db, "clients", clientId, "programs", programId, "customTasks");
    const docRef = await addDoc(customTaskRef, taskData);
    return { id: docRef.id, ...taskData };
  } catch (e) {
    console.error("Error adding custom task: ", e);
    throw e;
  }
};

// Função para obter as tarefas personalizadas de um programa de cliente
export const getCustomTasks = async (clientId, programId) => {
  try {
    const customTasksSnapshot = await getDocs(collection(db, "clients", clientId, "programs", programId, "customTasks"));
    const customTasksList = customTasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return customTasksList;
  } catch (e) {
    console.error("Error getting custom tasks: ", e);
    throw e;
  }
};

// Função para atualizar uma tarefa personalizada de um programa de cliente
export const updateCustomTask = async (clientId, programId, taskId, taskData) => {
  try {
    const taskDoc = doc(db, "clients", clientId, "programs", programId, "customTasks", taskId);
    await updateDoc(taskDoc, taskData);
  } catch (e) {
    console.error("Error updating custom task: ", e);
    throw e;
  }
};

// Função para deletar uma tarefa personalizada de um programa de cliente
export const deleteCustomTask = async (clientId, programId, taskId) => {
  try {
    await deleteDoc(doc(db, "clients", clientId, "programs", programId, "customTasks", taskId));
  } catch (e) {
    console.error("Error deleting custom task: ", e);
    throw e;
  }
};
