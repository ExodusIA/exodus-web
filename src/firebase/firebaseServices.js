import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "/firebaseConfig";

// Funções para manipular programas
export const getPrograms = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "programs"));
    const programsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return programsList;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
};

export const addProgram = async (programData) => {
  try {
    const docRef = await addDoc(collection(db, "programs"), programData);
    return { id: docRef.id, ...programData };
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const updateProgram = async (programId, programData) => {
  try {
    const programDoc = doc(db, "programs", programId);
    await updateDoc(programDoc, programData);
  } catch (e) {
    console.error("Error updating program: ", e);
  }
};

export const deleteProgram = async (programId) => {
  try {
    await deleteDoc(doc(db, "programs", programId));
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
};

// Funções para manipular tarefas dos programas
export const getProgramTasks = async (programId) => {
  try {
    const querySnapshot = await getDocs(collection(db, "programs", programId, "programTasks"));
    const tasksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return tasksList;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
};

export const addProgramTask = async (programId, taskData) => {
  try {
    const docRef = await addDoc(collection(db, "programs", programId, "programTasks"), taskData);
    return { id: docRef.id, ...taskData };
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const updateProgramTask = async (programId, taskId, taskData) => {
  try {
    const taskDoc = doc(db, "programs", programId, "programTasks", taskId);
    await updateDoc(taskDoc, taskData);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
};

export const deleteProgramTask = async (programId, taskId) => {
  try {
    await deleteDoc(doc(db, "programs", programId, "programTasks", taskId));
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
};

// Funções para buscar alunos
export const getClients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clients"));
      const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return clientsList;
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  };
  
  // Função para adicionar um programa a clientes
  export const addClientProgram = async (clientProgramData) => {
    try {
      const docRef = await addDoc(collection(db, "clientPrograms"), clientProgramData);
      console.log("Document written with ID: ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  export const getClientPrograms = async (clientId) => {
    try {
      const q = query(collection(db, "clientPrograms"), where("clientId", "==", clientId));
      const querySnapshot = await getDocs(q);
      const programsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Fetch program names and durations
      const programsWithDetails = await Promise.all(
        programsList.map(async (program) => {
          const programDoc = await getDoc(doc(db, "programs", program.programId));
          const programData = programDoc.data();
          return { ...program, programName: programData.name, programDuration: programData.duration };
        })
      );
  
      return programsWithDetails;
    } catch (e) {
      console.error("Error getting documents: ", e);
    }
  };

  export const deleteClientProgram = async (clientProgramId) => {
    try {
      await deleteDoc(doc(db, "clientPrograms", clientProgramId));
      console.log("Document deleted with ID: ", clientProgramId);
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  // Função para buscar tarefas personalizadas
export const getCustomTasks = async (clientProgramId) => {
  try {
    const customTasksSnapshot = await getDocs(collection(db, `clientPrograms/${clientProgramId}/customTasks`));
    const customTasks = customTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return customTasks;
  } catch (e) {
    console.error("Error getting custom tasks: ", e);
  }
};

// Função para adicionar uma tarefa personalizada
export const addCustomTask = async (clientProgramId, customTaskData) => {
  try {
    const docRef = await addDoc(collection(db, `clientPrograms/${clientProgramId}/customTasks`), customTaskData);
    return { id: docRef.id, ...customTaskData };
  } catch (e) {
    console.error("Error adding custom task: ", e);
  }
};