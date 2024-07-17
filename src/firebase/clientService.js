// Importações do Firebase
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp, updateDoc, query, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "./firebaseConfig";

//Função para adicionar um cliente
export const addClient = async (clientData) => {
  try {
    const docRef = await addDoc(collection(db, "clients"), clientData);
    return { id: docRef.id, ...clientData };
  } catch (e) {
    console.error("Error adding client: ", e);
    throw e;
  }
};

// Função para atualizar dados de um cliente
export const updateClient = async (clientId, clientData) => {
  try {
    const clientDoc = doc(db, "clients", clientId);
    await updateDoc(clientDoc, clientData);
  } catch (e) {
    console.error("Error updating client: ", e);
  }
};

// Função para deletar dados de um cliente
export const deleteClient = async (clientId) => {
  try {
    await deleteDoc(doc(db, "clients", clientId));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

// Função para obter todos os clientes
export const getClients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clientsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return clientsList;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};

// Função para adicionar um programa a um cliente
export const addClientProgram = async (clientId, programId, startDate, duration) => {
  try {
    const clientProgramRef = collection(db, "clients", clientId, "programs");
    const docRef = await addDoc(clientProgramRef, {
      programId,
      startDate: Timestamp.fromDate(new Date(startDate)),
      duration,
    });
    return { id: docRef.id, programId, startDate, duration };
  } catch (e) {
    console.error("Error adding client program: ", e);
    throw e;
  }
};

// Função para obter os programas de um cliente
export const getClientPrograms = async (clientId) => {
  try {
    const q = query(collection(db, "clients", clientId, "programs"));
    const querySnapshot = await getDocs(q);
    const programsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Fetch program details and calculate duration
    const programsWithDetails = await Promise.all(
      programsList.map(async (program) => {
        const programDoc = await getDoc(doc(db, "programs", program.programId));
        const programData = programDoc.data();
        
        // Fetch tasks to calculate duration
        const tasksSnapshot = await getDocs(collection(db, "programs", program.programId, "tasks"));
        const tasks = tasksSnapshot.docs.map(doc => doc.data());
        const lastTaskDay = Math.max(...tasks.map(task => task.day), 0);
        
        return { 
          ...program, 
          programName: programData.name, 
          lastTaskDay 
        };
      })
    );

    return programsWithDetails;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
};

// Função para deletar um programa de um cliente
export const deleteClientProgram = async (clientId, clientProgramId) => {
  try {
    await deleteDoc(doc(db, "clients", clientId, "programs", clientProgramId));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

/* ----------------------------------------------------------------
 * Metas dos clientes
 * ---------------------------------------------------------------- */

// Função para obter as metas de um cliente
export const getClientGoals = async (clientId) => {
  try {
    const goalsSnapshot = await getDocs(collection(db, "clients", clientId, "goals"));
    const goalsList = goalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return goalsList;
  } catch (e) {
    console.error("Error getting goals: ", e);
  }
};

// Função para adicionar uma meta a um cliente
export const addClientGoal = async (clientId, goalData) => {
  try {
    const docRef = await addDoc(collection(db, "clients", clientId, "goals"), goalData);
    console.log("Goal added with ID: ", docRef.id);
    return { id: docRef.id, ...goalData };
  } catch (e) {
    console.error("Error adding goal: ", e);
  }
};

// Função para atualizar uma meta de um cliente
export const updateClientGoal = async (clientId, goalId, goalData) => {
  try {
    const goalDoc = doc(db, "clients", clientId, "goals", goalId);
    await updateDoc(goalDoc, goalData);
  } catch (e) {
    console.error("Error updating goal: ", e);
  }
};

// Função para deletar uma meta de um cliente
export const deleteClientGoal = async (clientId, goalId) => {
  try {
    await deleteDoc(doc(db, "clients", clientId, "goals", goalId));
    console.log("Goal deleted with ID: ", goalId);
  } catch (e) {
    console.error("Error deleting goal: ", e);
  }
};

/* ----------------------------------------------------------------
 * Exames dos clientes
 * ---------------------------------------------------------------- */

// Função para adicionar um exame a um cliente
export const addClientExam = async (clientId, examData, file) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `clients/${clientId}/exams/${file.name}`);
    await uploadBytes(storageRef, file);
    const fileURL = await getDownloadURL(storageRef);

    const examDoc = {
      ...examData,
      fileURL,
      filePath: `clients/${clientId}/exams/${file.name}`, // Adicione o caminho do arquivo aqui
      fileName: file.name,
    };

    const docRef = await addDoc(collection(db, "clients", clientId, "exams"), examDoc);
    return { id: docRef.id, ...examDoc };
  } catch (e) {
    console.error("Error adding exam:", e);
  }
};

// Função para deletar um exame de um cliente
export const deleteClientExam = async (clientId, examId, fileName) => {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, `clients/${clientId}/exams/${fileName}`);
    await deleteObject(fileRef);

    const examDocRef = doc(db, "clients", clientId, "exams", examId);
    await deleteDoc(examDocRef);
  } catch (e) {
    console.error("Error deleting exam:", e);
  }
};

// Função para obter os exames de um cliente
export const getClientExams = async (clientId) => {
  const examsSnapshot = await getDocs(collection(db, "clients", clientId, "exams"));
  const examsList = examsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return examsList;
};
