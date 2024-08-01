import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp, updateDoc, query, where, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "./firebaseConfig.js";

// Função para adicionar um cliente
export const addClient = async (clientData) => {
  try {
    const clientDataWithRefs = {
      ...clientData,
      business: doc(db, 'businesses', clientData.business), // Crie a referência ao negócio
      groups: clientData.groups.map(groupId => doc(db, 'groups', groupId)) // Crie as referências aos grupos
    };
    const docRef = await addDoc(collection(db, "clients"), clientDataWithRefs);
    return { id: docRef.id, ...clientDataWithRefs };
  } catch (e) {
    console.error("Error adding client: ", e);
    throw e;
  }
};

// Função para atualizar dados de um cliente
export const updateClient = async (clientId, clientData) => {
  try {
    // Transformar grupos em referências
    const clientDataWithRefs = {
      ...clientData,  
    };
  
    const clientDoc = doc(db, "clients", clientId);
    await updateDoc(clientDoc, clientDataWithRefs);
  } catch (e) {
    console.error("Error updating client: ", e);
    throw e;
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

// Função para obter todos os clientes de um negócio específico
export const getClients = async (businessId) => {
  try {
    const businessRef = doc(db, 'businesses', businessId); // Crie uma referência ao documento do negócio
    const clientsRef = collection(db, "clients");
    const q = query(clientsRef, where("business", "==", businessRef)); // Compare a referência diretamente
    const querySnapshot = await getDocs(q);
    const clientsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return clientsList;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};

// Função para obter os dados de um cliente pelo ID
export const getClientById = async (clientId) => {
  try {
    const clientDocRef = doc(db, "clients", clientId);
    const clientDoc = await getDoc(clientDocRef);

    if (clientDoc.exists()) {
      return { id: clientDoc.id, ...clientDoc.data() };
    } else {
      throw new Error("Cliente não encontrado");
    }
  } catch (e) {
    console.error("Error getting client by ID: ", e);
    throw e;
  }
};

// Função para adicionar um programa a um cliente
export const addClientProgram = async (clientId, programId, instructorId, startDate) => {
  try {
    const clientProgramRef = collection(db, "clients", clientId, "programs");
    const programRef = doc(db, "programs", programId); // Crie uma referência ao documento do programa
    const instructorRef = doc(db, "instructors", instructorId); // Crie uma referência ao documento do programa
    const docRef = await addDoc(clientProgramRef, {
      program: programRef,
      instructor: instructorRef,
      startDate: Timestamp.fromDate(new Date(startDate)),
    });
    return { id: docRef.id, program: programRef, instructor: instructorRef, startDate };
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
        const programDoc = await getDoc(program.program); // Use a referência ao programa
        const programData = programDoc.data();

        // Fetch tasks to calculate duration
        const tasksSnapshot = await getDocs(collection(db, "programs", programDoc.id, "tasks"));
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
    throw e;
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
    throw e;
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
    throw e;
  }
};

// Função para atualizar uma meta de um cliente
export const updateClientGoal = async (clientId, goalId, goalData) => {
  try {
    const goalDoc = doc(db, "clients", clientId, "goals", goalId);
    await updateDoc(goalDoc, goalData);
  } catch (e) {
    console.error("Error updating goal: ", e);
    throw e;
  }
};

// Função para deletar uma meta de um cliente
export const deleteClientGoal = async (clientId, goalId) => {
  try {
    await deleteDoc(doc(db, "clients", clientId, "goals", goalId));
    console.log("Goal deleted with ID: ", goalId);
  } catch (e) {
    console.error("Error deleting goal: ", e);
    throw e;
  }
};

/* ----------------------------------------------------------------
 * Arquivos dos clientes
 * ---------------------------------------------------------------- */

// Função para adicionar um arquivo a um cliente
export const addClientFile = async (clientId, fileData, file) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `clients/${clientId}/files/${file.name}`);
    await uploadBytes(storageRef, file);
    const fileURL = await getDownloadURL(storageRef);

    const fileDoc = {
      ...fileData,
      fileURL,
      filePath: `clients/${clientId}/files/${file.name}`, // Adicione o caminho do arquivo aqui
      fileName: file.name,
    };

    const docRef = await addDoc(collection(db, "clients", clientId, "files"), fileDoc);
    return { id: docRef.id, ...fileDoc };
  } catch (e) {
    console.error("Error adding file:", e);
    throw e;
  }
};

// Função para deletar um arquivo de um cliente
export const deleteClientFile = async (clientId, fileId, fileName) => {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, `clients/${clientId}/files/${fileName}`);
    await deleteObject(fileRef);

    const fileDocRef = doc(db, "clients", clientId, "files", fileId);
    await deleteDoc(fileDocRef);
  } catch (e) {
    console.error("Error deleting file:", e);
    throw e;
  }
};

// Função para obter os arquivos de um cliente
export const getClientFiles = async (clientId) => {
  const filesSnapshot = await getDocs(collection(db, "clients", clientId, "files"));
  const filesList = filesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return filesList;
};
