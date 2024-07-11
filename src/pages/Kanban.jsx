import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import Modal from 'react-modal';
import { format, parseISO, isValid, differenceInMonths } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClientPrograms, updateClient, getSignedUrl, deleteClientProgram, getClientGoals, addClientGoal, updateClientGoal, deleteClientGoal, addClientExam, deleteClientExam, getClientExams } from '../firebase/firebaseServices';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrashIcon } from '@radix-ui/react-icons';
import { functions, httpsCallable } from '../../firebaseConfig'; // Importação do módulo de funções

const statusOptions = [
  { value: 1, label: 'Ativo' },
  { value: 0, label: 'Inativo' },
];

const programOptions = [
  { value: 'Mentoria', label: 'Mentoria' },
  { value: 'Clube de Desafios', label: 'Clube de Desafios' },
];

const classOptions = [
  { value: 'CERET - TERÇA E QUINTA - 6:45', label: 'CERET - TERÇA E QUINTA - 6:45' },
  { value: 'CERET - SEGUNDA E QUARTA - 18:30', label: 'CERET - SEGUNDA E QUARTA - 18:30' },
  { value: 'CERET - TERÇA E QUINTA - 8:15', label: 'CERET - TERÇA E QUINTA - 8:15' },
  { value: 'CERET - TERÇA E QUINTA - 9:45 (TURMA 60+)', label: 'CERET - TERÇA E QUINTA - 9:45 (TURMA 60+)' },
  { value: 'Mentoria Individual', label: 'Mentoria Individual' },
  { value: 'Clube de Desafios', label: 'Clube de Desafios' },
  { value: 'IBIRA', label: 'IBIRA' },
];

const examOptions = [
  { value: 'Biorressonância', label: 'Biorressonância' },
  { value: 'Bioimpedância', label: 'Bioimpedância' },
  { value: 'Ergoespirograma', label: 'Ergoespirograma' },
  { value: 'Exame de sangue', label: 'Exame de sangue' },
  { value: 'Other', label: 'Other' },
];

const Kanban = () => {
  const location = useLocation();
  const { clientData: initialClientData } = location.state;
  const [clientData, setClientData] = useState(initialClientData);
  const [programs, setPrograms] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [client, setClient] = useState(initialClientData);
  const [successMessage, setSuccessMessage] = useState('');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ goal: "", deadline: "", completed: false });
  const [goalModalIsOpen, setGoalModalIsOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [newExam, setNewExam] = useState({ date: "", file: null, type: "", observation: "" });
  const [examModalIsOpen, setExamModalIsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [otherExamType, setOtherExamType] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      if (clientData && clientData.id) {
        const programsList = await getClientPrograms(clientData.id);
        setPrograms(programsList);
      }
    };

    fetchPrograms();
  }, [clientData]);

  useEffect(() => {
    const fetchGoals = async () => {
      if (clientData && clientData.id) {
        const goalsList = await getClientGoals(clientData.id);
        setGoals(goalsList);
      }
    };

    fetchGoals();
  }, [clientData]);

  useEffect(() => {
    const fetchExams = async () => {
      if (clientData && clientData.id) {
        const examsList = await getClientExams(clientData.id);
        setExams(examsList);
      }
    };

    fetchExams();
  }, [clientData]);

  useEffect(() => {
    if (modalIsOpen) {
      setClient(clientData);
    }
  }, [modalIsOpen, clientData]);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const validateClient = () => {
    const newErrors = {};
    if (!client.name) newErrors.name = 'Nome é obrigatório';
    if (!client.nickName) newErrors.nickName = 'Apelido é obrigatório';
    if (!client.phone) newErrors.phone = 'Telefone é obrigatório';
    if (!client.email) newErrors.email = 'E-mail é obrigatório';
    if (!client.status) newErrors.status = 'Status é obrigatório';
    if (!client.program) newErrors.program = 'Programa é obrigatório';
    if (!client.class) newErrors.class = 'Turma é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClient = async () => {
    if (!validateClient()) return;

    try {
      const { id, ...clientDataToUpdate } = client; // Remove o campo id
      await updateClient(id, clientDataToUpdate); // Envia o objeto sem o campo id para atualização
      setSuccessMessage('Cliente atualizado com sucesso!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      setModalIsOpen(false);
      setClientData({ ...client, id }); // Atualiza o estado do clientData com os novos dados do cliente
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteProgram = async (clientProgramId) => {
    try {
      const confirmAction = window.confirm("Você tem certeza que deseja excluir este programa?");
      if (confirmAction) {
        await deleteClientProgram(clientProgramId);
        setPrograms(programs.filter(program => program.id !== clientProgramId));
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const calculateStatus = (assignedDate, duration) => {
    const today = new Date();
    const startDate = assignedDate.toDate ? assignedDate.toDate() : new Date(assignedDate);
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    if (daysPassed < 0) return 'Não Iniciado';
    return daysPassed <= duration ? 'Ativo' : 'Concluído';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Concluído':
        return 'bg-red-100 text-red-800';
      case 'Não Iniciado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inativo':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  const validateGoal = () => {
    const newErrors = {};
    if (!newGoal.goal) newErrors.goal = 'Meta é obrigatória';
    if (!newGoal.deadline || !isValid(new Date(newGoal.deadline))) newErrors.deadline = 'Prazo é obrigatório e deve ser uma data válida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funções de manipulação de metas
  const handleAddGoal = async () => {
    if (!validateGoal()) return;

    if (clientData && clientData.id) {
      const date = new Date(newGoal.deadline);
      date.setDate(date.getDate() + 1);
      const goalData = { ...newGoal, deadline: Timestamp.fromDate(date) };
      const goal = await addClientGoal(clientData.id, goalData);
      setGoals([...goals, goal]);
      setNewGoal({ goal: "", deadline: "", completed: false });
      setGoalModalIsOpen(false);
    }
  };

  const handleUpdateGoal = async (goalId, updatedData) => {
    if (clientData && clientData.id) {
      if (updatedData.deadline) {
        updatedData.deadline = Timestamp.fromDate(new Date(updatedData.deadline));
      }
      await updateClientGoal(clientData.id, goalId, updatedData);
      setGoals(goals.map(goal => (goal.id === goalId ? { ...goal, ...updatedData } : goal)));
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (clientData && clientData.id) {
      const confirmAction = window.confirm("Você tem certeza que deseja excluir esta meta?");
      if (confirmAction) {
        await deleteClientGoal(clientData.id, goalId);
        setGoals(goals.filter(goal => goal.id !== goalId));
      }
    }
  };

  const validateExam = () => {
    const newErrors = {};
    if (!newExam.date || !isValid(new Date(newExam.date))) newErrors.date = 'Data de realização do exame é obrigatória e deve ser uma data válida';
    if (!newExam.file) newErrors.file = 'Arquivo do exame é obrigatório';
    if (!newExam.type) newErrors.type = 'Tipo de exame é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExam = async () => {
    if (!validateExam()) return;

    if (clientData && clientData.id) {
      const date = new Date(newExam.date);
      date.setDate(date.getDate() + 1);
      const examType = newExam.type === 'Outro' ? otherExamType : newExam.type;
      const examData = { date: Timestamp.fromDate(date), type: examType, observation: newExam.observation };
      const exam = await addClientExam(clientData.id, examData, newExam.file);
      setExams([...exams, exam]);
      setNewExam({ date: "", file: null, type: "", observation: "" });
      setOtherExamType("");
      setExamModalIsOpen(false);
    }
  };

  const handleDeleteExam = async (examId, fileName) => {
    if (clientData && clientData.id) {
      const confirmAction = window.confirm("Você tem certeza que deseja excluir este exame?");
      if (confirmAction) {
        await deleteClientExam(clientData.id, examId, fileName);
        setExams(exams.filter(exam => exam.id !== examId));
      }
    }
  };

  const handleOpenPDF = async (filePath) => {
    try {
      const response = await fetch('https://us-central1-exodus-c5202.cloudfunctions.net/generateSignedUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        window.open(data.signedUrl, '_blank');
      } else {
        console.error('Failed to generate signed URL:', data.error);
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
    }
  };
  

  
  
  
  const checkExamValidity = (examDate, examType) => {
    const currentDate = new Date();
    const examDateObject = examDate.toDate ? examDate.toDate() : new Date(examDate);
    const monthsDifference = differenceInMonths(currentDate, examDateObject);
  
    if (examType === "Biorressonância" || examType === "Bioimpedância") {
      return monthsDifference <= 6 ? "Válido" : "Inválido";
    }
  
    return monthsDifference <= 12 ? "Válido" : "Inválido";
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-md relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Sobre Você</h2>
            <Button onClick={openModal}>
              Editar Cliente
            </Button>
          </div>
          <div>
            <p><strong>Nome:</strong> {clientData.name}</p>
            <p><strong>Apelido:</strong> {clientData.nickName}</p>
            <p><strong>Telefone:</strong> {clientData.phone}</p>
            <p><strong>E-mail:</strong> {clientData.email}</p>
            <p><strong>Status: </strong> 
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(clientData.status === 1 ? 'Ativo' : 'Inativo')}`}>
                {clientData.status === 1 ? 'Ativo' : 'Inativo'}
              </span>
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Exames</h2>
            <Button onClick={() => setExamModalIsOpen(true)}>
              Adicionar Exame
            </Button>
          </div>
          <div className="max-h-44 overflow-y-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Exame</TableHead>
                  <TableHead>Data de Realização</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length > 0 ? (
                  exams.map((exam) => {
                    const validityStatus = checkExamValidity(exam.date, exam.type);                    
                    return (
                      <TableRow key={exam.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => handleOpenPDF(exam.filePath)}>
                        <TableCell>
                          {exam.type}
                        </TableCell>
                        <TableCell>{exam.date ? format(parseISO(exam.date.toDate ? exam.date.toDate().toISOString() : exam.date), 'dd/MM/yyyy') : 'Data Inválida'}</TableCell>
                        <TableCell>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${validityStatus === 'Válido' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {validityStatus}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <TrashIcon
                            onClick={() => handleDeleteExam(exam.id, exam.fileName)}
                            className="text-red-500 cursor-pointer"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center">Nenhum exame adicionado</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Resultados e Reflexões</h2>
          {/* Lógica para exibir resultados e reflexões */}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-md md:col-span-2 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Programas</h2>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Programa</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.length > 0 ? (
                  programs.map((program) => {
                    const status = calculateStatus(program.assignedDate, program.programDuration);
                    return (
                      <TableRow key={program.id}>
                        <TableCell>{program.programName}</TableCell>
                        <TableCell>{program.assignedDate ? format(parseISO(program.assignedDate.toDate ? program.assignedDate.toDate().toISOString() : program.assignedDate), 'dd/MM/yyyy') : 'Data Inválida'}</TableCell>
                        <TableCell>{program.programDuration} dias</TableCell>
                        <TableCell>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}`}>
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button onClick={() => handleDeleteProgram(program.id)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded">
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center">Nenhum programa ativo</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-md relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Metas</h2>
            <Button onClick={() => setGoalModalIsOpen(true)}>
              Adicionar Meta
            </Button>
          </div>
          <div>
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.length > 0 ? (
                  goals.map((goal) => (
                    <TableRow key={goal.id} className={goal.completed ? 'line-through text-gray-500' : ''}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={(e) => handleUpdateGoal(goal.id, { completed: e.target.checked })}
                        />
                      </TableCell>
                      <TableCell>{goal.goal}</TableCell>
                      <TableCell>{goal.deadline ? format(parseISO(goal.deadline.toDate ? goal.deadline.toDate().toISOString() : goal.deadline), 'dd/MM/yyyy') : 'Data Inválida'}</TableCell>
                      <TableCell>
                        <TrashIcon
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-500 cursor-pointer"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center">Nenhuma meta definida</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
  
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Editar Cliente"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">Editar Cliente</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <Input
                  type="text"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apelido</label>
                <Input
                  type="text"
                  value={client.nickName}
                  onChange={(e) => setClient({ ...client, nickName: e.target.value })}
                />
                {errors.nickName && <p className="text-red-500 text-xs italic">{errors.nickName}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <Input
                type="text"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />
              {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <Input
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
              />
              {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={statusOptions.find(option => option.value === client.status)}
                  onChange={(selectedOption) => setClient({ ...client, status: selectedOption.value })}
                  options={statusOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                {errors.status && <p className="text-red-500 text-xs italic">{errors.status}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Programa</label>
                <Select
                  value={programOptions.find(option => option.value === client.program)}
                  onChange={(selectedOption) => setClient({ ...client, program: selectedOption.value })}
                  options={programOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                {errors.program && <p className="text-red-500 text-xs italic">{errors.program}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Turma</label>
                <Select
                  value={classOptions.find(option => option.value === client.class)}
                  onChange={(selectedOption) => setClient({ ...client, class: selectedOption.value })}
                  options={classOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPlacement="top"
                />
                {errors.class && <p className="text-red-500 text-xs italic">{errors.class}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={closeModal} variant="secondary" className="mr-2">
                Cancelar
              </Button>
              <Button onClick={handleSaveClient}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
  
      <Modal
        isOpen={goalModalIsOpen}
        onRequestClose={() => setGoalModalIsOpen(false)}
        contentLabel="Adicionar Meta"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">Adicionar Meta</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta</label>
              <Input
                type="text"
                value={newGoal.goal}
                onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })}
                placeholder="Meta"
              />
              {errors.goal && <p className="text-red-500 text-xs italic">{errors.goal}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prazo</label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
              {errors.deadline && <p className="text-red-500 text-xs italic">{errors.deadline}</p>}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setGoalModalIsOpen(false)} variant="secondary" className="mr-2">
                Cancelar
              </Button>
              <Button onClick={handleAddGoal}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={examModalIsOpen}
        onRequestClose={() => setExamModalIsOpen(false)}
        contentLabel="Adicionar Exame"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">Adicionar Exame</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Realização</label>
              <Input
                type="date"
                value={newExam.date}
                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
              />
              {errors.date && <p className="text-red-500 text-xs italic">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Exame</label>
              <Select
                value={examOptions.find(option => option.value === newExam.type)}
                onChange={(selectedOption) => setNewExam({ ...newExam, type: selectedOption.value })}
                options={examOptions}
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {newExam.type === 'Outro' && (
                <Input
                  type="text"
                  value={otherExamType}
                  onChange={(e) => setOtherExamType(e.target.value)}
                  placeholder="Digite o tipo de exame"
                  className="mt-2"
                />
              )}
              {errors.type && <p className="text-red-500 text-xs italic">{errors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Arquivo</label>
              <Input
                type="file"
                onChange={(e) => setNewExam({ ...newExam, file: e.target.files[0] })}
              />
              {errors.file && <p className="text-red-500 text-xs italic">{errors.file}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Observação</label>
              <Input
                type="text"
                value={newExam.observation}
                onChange={(e) => setNewExam({ ...newExam, observation: e.target.value })}
                placeholder="Observação"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setExamModalIsOpen(false)} variant="secondary" className="mr-2">
                Cancelar
              </Button>
              <Button onClick={handleAddExam}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Kanban;
