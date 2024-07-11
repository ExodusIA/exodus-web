import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db } from "../../firebaseConfig"; // Certifique-se de que o caminho está correto para o seu arquivo de configuração do Firebase

// Funções para manipular programs na coleção geral
export const getPrograms = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "programs"));
    const programsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

// Funções para manipular tarefas dos programs na coleção geral
export const getProgramTasks = async (programId) => {
  try {
    const querySnapshot = await getDocs(collection(db, "programs", programId, "programTasks"));
    const tasksList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

// Funções para buscar clientes
export const getClients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clientsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return clientsList;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
};

// Função para adicionar um programa a clientes
export const addClientProgram = async (clientId, programId, assignedDate, duration) => {
  try {
    const programDoc = await getDoc(doc(db, "programs", programId));
    const programData = programDoc.data();
    
    const clientProgramData = {
      ...programData,
      assignedDate,
      duration,
    };

    const docRef = await addDoc(collection(db, "clients", clientId, "programs"), clientProgramData);
    console.log("Program assigned with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getClientPrograms = async (clientId) => {
  try {
    const programsSnapshot = await getDocs(collection(db, "clients", clientId, "programs"));
    const programsList = programsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return programsList;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
};

export const deleteClientProgram = async (clientId, clientProgramId) => {
  try {
    await deleteDoc(doc(db, "clients", clientId, "programs", clientProgramId));
    console.log("Document deleted with ID: ", clientProgramId);
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
};

// Função para buscar tarefas personalizadas de um programa de cliente
export const getCustomTasks = async (clientId, clientProgramId) => {
  try {
    const customTasksSnapshot = await getDocs(collection(db, `clients/${clientId}/programs/${clientProgramId}/customTasks`));
    const customTasks = customTasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return customTasks;
  } catch (e) {
    console.error("Error getting custom tasks: ", e);
  }
};

// Função para adicionar uma tarefa personalizada a um programa de cliente
export const addCustomTask = async (clientId, clientProgramId, customTaskData) => {
  try {
    const docRef = await addDoc(collection(db, `clients/${clientId}/programs/${clientProgramId}/customTasks`), customTaskData);
    return { id: docRef.id, ...customTaskData };
  } catch (e) {
    console.error("Error adding custom task: ", e);
  }
};

// Função para atualizar dados do cliente
export const updateClient = async (clientId, clientData) => {
  try {
    const clientDoc = doc(db, "clients", clientId);
    await updateDoc(clientDoc, clientData);
  } catch (e) {
    console.error("Error updating client: ", e);
  }
};

// Funções para manipular metas dos clientes
export const getClientGoals = async (clientId) => {
  try {
    const goalsSnapshot = await getDocs(collection(db, "clients", clientId, "goals"));
    const goalsList = goalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return goalsList;
  } catch (e) {
    console.error("Error getting goals: ", e);
  }
};

export const addClientGoal = async (clientId, goalData) => {
  try {
    const docRef = await addDoc(collection(db, "clients", clientId, "goals"), goalData);
    console.log("Goal added with ID: ", docRef.id);
    return { id: docRef.id, ...goalData };
  } catch (e) {
    console.error("Error adding goal: ", e);
  }
};

export const updateClientGoal = async (clientId, goalId, goalData) => {
  try {
    const goalDoc = doc(db, "clients", clientId, "goals", goalId);
    await updateDoc(goalDoc, goalData);
  } catch (e) {
    console.error("Error updating goal: ", e);
  }
};

export const deleteClientGoal = async (clientId, goalId) => {
  try {
    await deleteDoc(doc(db, "clients", clientId, "goals", goalId));
    console.log("Goal deleted with ID: ", goalId);
  } catch (e) {
    console.error("Error deleting goal: ", e);
  }
};

// Função para adicionar exame a um cliente
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

// Função para deletar exame de um cliente
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

// Função para obter exames de um cliente
export const getClientExams = async (clientId) => {
  const examsSnapshot = await getDocs(collection(db, "clients", clientId, "exams"));
  const examsList = examsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return examsList;
};

export const getSignedUrl = async (filePath) => {
  const storage = getStorage();
  const fileRef = ref(storage, filePath);

  try {
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    throw new Error('Failed to generate signed URL');
  }
};