// // Importações do Firebase
// import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from "firebase/firestore";
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
// import { db } from "./firebaseConfig";

// /* ----------------------------------------------------------------
//  * Programas gerais
//  * ---------------------------------------------------------------- */

// // Função para obter todos os programas
// export const getPrograms = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, "programs"));
//     const programsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return programsList;
//   } catch (e) {
//     console.error("Error getting documents: ", e);
//     throw e;
//   }
// };

// // Função para adicionar um novo programa
// export const addProgram = async (programData) => {
//   try {
//     const docRef = await addDoc(collection(db, "programs"), programData);
//     return { id: docRef.id, ...programData };
//   } catch (e) {
//     console.error("Error adding document: ", e);
//     throw e;
//   }
// };

// // Função para atualizar um programa existente
// export const updateProgram = async (programId, programData) => {
//   try {
//     const programDoc = doc(db, "programs", programId);
//     await updateDoc(programDoc, programData);
//   } catch (e) {
//     console.error("Error updating program: ", e);
//     throw e;
//   }
// };

// // Função para deletar um programa
// export const deleteProgram = async (programId) => {
//   try {
//     await deleteDoc(doc(db, "programs", programId));
//   } catch (e) {
//     console.error("Error deleting document: ", e);
//     throw e;
//   }
// };

// /* ----------------------------------------------------------------
//  * Tarefas dos programas
//  * ---------------------------------------------------------------- */

// // Função para obter todas as tarefas de um programa específico
// export const getProgramTasks = async (programId) => {
//   try {
//     const querySnapshot = await getDocs(collection(db, "programs", programId, "tasks"));
//     const tasksList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return tasksList;
//   } catch (e) {
//     console.error("Error getting documents: ", e);
//   }
// };

// // Função para obter o último dia de tarefa de um programa
// export const getProgramLastTaskDay = async (programId) => {
//   try {
//     const tasksSnapshot = await getDocs(collection(db, "programs", programId, "tasks"));
//     const tasks = tasksSnapshot.docs.map(doc => doc.data());
//     const lastTaskDay = Math.max(...tasks.map(task => task.day), 0);
//     return lastTaskDay;
//   } catch (e) {
//     console.error("Error getting tasks: ", e);
//     return 0;
//   }
// };

// // Função para adicionar uma tarefa a um programa
// export const addProgramTask = async (programId, taskData) => {
//   try {
//     const { taskName, taskDescription, day } = taskData;
//     const docRef = await addDoc(collection(db, "programs", programId, "tasks"), { taskName, taskDescription, day });
//     return { id: docRef.id, taskName, taskDescription, day };
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// };

// // Função para atualizar uma tarefa de um programa
// export const updateProgramTask = async (programId, taskId, taskData) => {
//   try {
//     const { taskName, taskDescription, day } = taskData;
//     const taskDoc = doc(db, "programs", programId, "tasks", taskId);
//     await updateDoc(taskDoc, { taskName, taskDescription, day });
//   } catch (e) {
//     console.error("Error updating document: ", e);
//   }
// };

// // Função para deletar uma tarefa de um programa
// export const deleteProgramTask = async (programId, taskId) => {
//   try {
//     await deleteDoc(doc(db, "programs", programId, "tasks", taskId));
//   } catch (e) {
//     console.error("Error deleting document: ", e);
//   }
// };

// /* ----------------------------------------------------------------
//  * Clientes
//  * ---------------------------------------------------------------- */

// // Função para obter todos os clientes
// export const getClients = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(db, "clients"));
//     const clientsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return clientsList;
//   } catch (e) {
//     console.error("Error getting documents: ", e);
//   }
// };

// // Função para atualizar dados de um cliente
// export const updateClient = async (clientId, clientData) => {
//   try {
//     const clientDoc = doc(db, "clients", clientId);
//     await updateDoc(clientDoc, clientData);
//   } catch (e) {
//     console.error("Error updating client: ", e);
//   }
// };

// /* ----------------------------------------------------------------
//  * Programas dos clientes
//  * ---------------------------------------------------------------- */

// // Função para adicionar um programa a um cliente
// export const addClientProgram = async (clientId, programId, startDate) => {
//   try {
//     const clientProgramRef = collection(db, "clients", clientId, "programs");
//     const docRef = await addDoc(clientProgramRef, {
//       programId,
//       startDate: Timestamp.fromDate(new Date(startDate)),      
//     });
//     return { id: docRef.id, programId, startDate };
//   } catch (e) {
//     console.error("Error adding client program: ", e);
//   }
// };

// // Função para obter os programas de um cliente
// export const getClientPrograms = async (clientId) => {
//   try {
//     const q = query(collection(db, "clients", clientId, "programs"));
//     const querySnapshot = await getDocs(q);
//     const programsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//     // Fetch program details and calculate duration
//     const programsWithDetails = await Promise.all(
//       programsList.map(async (program) => {
//         const programDoc = await getDoc(doc(db, "programs", program.programId));
//         const programData = programDoc.data();
        
//         // Fetch tasks to calculate duration
//         const tasksSnapshot = await getDocs(collection(db, "programs", program.programId, "tasks"));
//         const tasks = tasksSnapshot.docs.map(doc => doc.data());
//         const lastTaskDay = Math.max(...tasks.map(task => task.day), 0);
        
//         return { 
//           ...program, 
//           programName: programData.name, 
//           lastTaskDay 
//         };
//       })
//     );

//     return programsWithDetails;
//   } catch (e) {
//     console.error("Error getting documents: ", e);
//   }
// };

// // Função para deletar um programa de um cliente
// export const deleteClientProgram = async (clientId, clientProgramId) => {
//   try {
//     await deleteDoc(doc(db, "clients", clientId, "programs", clientProgramId));
//     console.log("Document deleted with ID: ", clientProgramId);
//   } catch (e) {
//     console.error("Error deleting document: ", e);
//   }
// };

// /* ----------------------------------------------------------------
//  * Tarefas personalizadas dos clientes
//  * ---------------------------------------------------------------- */

// // Função para adicionar uma tarefa personalizada a um programa de cliente
// export const addCustomTask = async (clientId, programId, taskData) => {
//   try {
//     const customTaskRef = collection(db, "clients", clientId, "programs", programId, "customTasks");
//     const docRef = await addDoc(customTaskRef, taskData);
//     return { id: docRef.id, ...taskData };
//   } catch (e) {
//     console.error("Error adding custom task: ", e);
//   }
// };

// // Função para obter as tarefas personalizadas de um programa de cliente
// export const getCustomTasks = async (clientId, programId) => {
//   try {
//     const customTasksSnapshot = await getDocs(collection(db, "clients", clientId, "programs", programId, "customTasks"));
//     const customTasksList = customTasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return customTasksList;
//   } catch (e) {
//     console.error("Error getting custom tasks: ", e);
//   }
// };

// // Função para atualizar uma tarefa personalizada de um programa de cliente
// export const updateCustomTask = async (clientId, programId, taskId, taskData) => {
//   try {
//     const taskDoc = doc(db, "clients", clientId, "programs", programId, "customTasks", taskId);
//     await updateDoc(taskDoc, taskData);
//   } catch (e) {
//     console.error("Error updating custom task: ", e);
//   }
// };

// // Função para deletar uma tarefa personalizada de um programa de cliente
// export const deleteCustomTask = async (clientId, programId, taskId) => {
//   try {
//     await deleteDoc(doc(db, "clients", clientId, "programs", programId, "customTasks", taskId));
//   } catch (e) {
//     console.error("Error deleting custom task: ", e);
//   }
// };

// /* ----------------------------------------------------------------
//  * Metas dos clientes
//  * ---------------------------------------------------------------- */

// // Função para obter as metas de um cliente
// export const getClientGoals = async (clientId) => {
//   try {
//     const goalsSnapshot = await getDocs(collection(db, "clients", clientId, "goals"));
//     const goalsList = goalsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return goalsList;
//   } catch (e) {
//     console.error("Error getting goals: ", e);
//   }
// };

// // Função para adicionar uma meta a um cliente
// export const addClientGoal = async (clientId, goalData) => {
//   try {
//     const docRef = await addDoc(collection(db, "clients", clientId, "goals"), goalData);
//     console.log("Goal added with ID: ", docRef.id);
//     return { id: docRef.id, ...goalData };
//   } catch (e) {
//     console.error("Error adding goal: ", e);
//   }
// };

// // Função para atualizar uma meta de um cliente
// export const updateClientGoal = async (clientId, goalId, goalData) => {
//   try {
//     const goalDoc = doc(db, "clients", clientId, "goals", goalId);
//     await updateDoc(goalDoc, goalData);
//   } catch (e) {
//     console.error("Error updating goal: ", e);
//   }
// };

// // Função para deletar uma meta de um cliente
// export const deleteClientGoal = async (clientId, goalId) => {
//   try {
//     await deleteDoc(doc(db, "clients", clientId, "goals", goalId));
//     console.log("Goal deleted with ID: ", goalId);
//   } catch (e) {
//     console.error("Error deleting goal: ", e);
//   }
// };

// /* ----------------------------------------------------------------
//  * Exames dos clientes
//  * ---------------------------------------------------------------- */

// // Função para adicionar um exame a um cliente
// export const addClientExam = async (clientId, examData, file) => {
//   try {
//     const storage = getStorage();
//     const storageRef = ref(storage, `clients/${clientId}/exams/${file.name}`);
//     await uploadBytes(storageRef, file);
//     const fileURL = await getDownloadURL(storageRef);

//     const examDoc = {
//       ...examData,
//       fileURL,
//       filePath: `clients/${clientId}/exams/${file.name}`, // Adicione o caminho do arquivo aqui
//       fileName: file.name,
//     };

//     const docRef = await addDoc(collection(db, "clients", clientId, "exams"), examDoc);
//     return { id: docRef.id, ...examDoc };
//   } catch (e) {
//     console.error("Error adding exam:", e);
//   }
// };

// // Função para deletar um exame de um cliente
// export const deleteClientExam = async (clientId, examId, fileName) => {
//   try {
//     const storage = getStorage();
//     const fileRef = ref(storage, `clients/${clientId}/exams/${fileName}`);
//     await deleteObject(fileRef);

//     const examDocRef = doc(db, "clients", clientId, "exams", examId);
//     await deleteDoc(examDocRef);
//   } catch (e) {
//     console.error("Error deleting exam:", e);
//   }
// };

// // Função para obter os exames de um cliente
// export const getClientExams = async (clientId) => {
//   const examsSnapshot = await getDocs(collection(db, "clients", clientId, "exams"));
//   const examsList = examsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//   return examsList;
// };

// // Função para obter a URL assinada de um arquivo
// export const getSignedUrl = async (filePath) => {
//   const storage = getStorage();
//   const fileRef = ref(storage, filePath);

//   try {
//     const url = await getDownloadURL(fileRef);
//     return url;
//   } catch (error) {
//     throw new Error('Failed to generate signed URL');
//   }
// };

// /* ----------------------------------------------------------------
//  * Feedback das tarefas
//  * ---------------------------------------------------------------- */

// // Função para adicionar um feedback a uma tarefa
// export const addTaskFeedback = async (clientId, programId, taskId, feedback) => {
//   try {
//     const feedbackRef = collection(db, "clients", clientId, "programs", programId, "tasks", taskId, "feedbacks");
//     const docRef = await addDoc(feedbackRef, { feedback, timestamp: Timestamp.now() });
//     return { id: docRef.id, feedback, timestamp: Timestamp.now() };
//   } catch (e) {
//     console.error("Error adding feedback: ", e);
//   }
// };

// // Função para obter feedbacks de uma tarefa
// export const getTaskFeedbacks = async (clientId, programId, taskId) => {
//   try {
//     const feedbacksSnapshot = await getDocs(collection(db, "clients", clientId, "programs", programId, "tasks", taskId, "feedbacks"));
//     const feedbacksList = feedbacksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     return feedbacksList;
//   } catch (e) {
//     console.error("Error getting feedbacks: ", e);
//   }
// };
