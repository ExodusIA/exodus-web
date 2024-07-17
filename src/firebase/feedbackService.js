// Importações do Firebase
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Função para adicionar um feedback a uma tarefa
export const addTaskFeedback = async (clientId, programId, taskId, feedback) => {
  try {
    const feedbackRef = collection(db, "clients", clientId, "programs", programId, "tasks", taskId, "feedbacks");
    const docRef = await addDoc(feedbackRef, { feedback, timestamp: Timestamp.now() });
    return { id: docRef.id, feedback, timestamp: Timestamp.now() };
  } catch (e) {
    console.error("Error adding feedback: ", e);
    throw e;
  }
};

// Função para adicionar um feedback a uma tarefa personalizada
export const addCustomTaskFeedback = async (clientId, programId, taskId, feedback) => {
  try {
    const feedbackRef = collection(db, "clients", clientId, "programs", programId, "customTasks", taskId, "feedbacks");
    const docRef = await addDoc(feedbackRef, { feedback, timestamp: Timestamp.now() });
    return { id: docRef.id, feedback, timestamp: Timestamp.now() };
  } catch (e) {
    console.error("Error adding feedback: ", e);
    throw e;
  }
};

// Função para obter feedbacks de uma tarefa
export const getTaskFeedbacks = async (clientId, programId, taskId) => {
  try {
    const feedbacksSnapshot = await getDocs(collection(db, "clients", clientId, "programs", programId, "tasks", taskId, "feedbacks"));
    const feedbacksList = feedbacksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return feedbacksList;
  } catch (e) {
    console.error("Error getting feedbacks: ", e);
    throw e;
  }
};

// Função para obter feedbacks de uma tarefa personalizada
export const getCustomTaskFeedbacks = async (clientId, programId, taskId) => {
  try {
    const feedbacksSnapshot = await getDocs(collection(db, "clients", clientId, "programs", programId, "customTasks", taskId, "feedbacks"));
    const feedbacksList = feedbacksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return feedbacksList;
  } catch (e) {
    console.error("Error getting feedbacks: ", e);
    throw e;
  }
};
