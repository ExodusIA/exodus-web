"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { format, parseISO, isValid, differenceInMonths, addHours } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getClientPrograms,
  getClientById,
  updateClient,
  deleteClientProgram,
  getClientGoals,
  addClientGoal,
  updateClientGoal,
  deleteClientGoal,
  addClientFile,
  deleteClientFile,
  getClientFiles,
  addClientProgram
} from '../services/clientService';
import {
  getPrograms,
  getProgramLastTaskDay
} from '../services/programService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrashIcon } from '@radix-ui/react-icons';
import { DatePickerDemo } from "@/components/ui/date-picker-demo";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useBusiness } from '@/contexts/BusinessContext';
import Select from 'react-select'

const statusOptions = [
  { value: true, label: 'Ativo' },
  { value: false, label: 'Inativo' },
];

const fileOptions = [
  { value: 'Biorressonância', label: 'Biorressonância' },
  { value: 'Bioimpedância', label: 'Bioimpedância' },
  { value: 'Ergoespirograma', label: 'Ergoespirograma' },
  { value: 'Exame de sangue', label: 'Exame de sangue' },
  { value: 'Outro', label: 'Outro' },
];

const Kanban = () => {
  const { clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [client, setClient] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ goal: "", deadline: "", completed: false });
  const [goalModalIsOpen, setGoalModalIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [newFile, setNewFile] = useState({ date: "", file: null, type: "", observation: "" });
  const [fileModalIsOpen, setFileModalIsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [otherFileType, setOtherFileType] = useState("");
  const [allPrograms, setAllPrograms] = useState([]);
  const [sendProgramModalIsOpen, setSendProgramModalIsOpen] = useState(false);
  const [selectedProgramToSend, setSelectedProgramToSend] = useState(null);
  const [programStartDate, setProgramStartDate] = useState(new Date());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const navigate = useNavigate();
  const { business, loading } = useBusiness();

  useEffect(() => {
    const fetchClientData = async (clientId) => {
      try {
        if (loading) return; // Aguarde até que o estado de carregamento esteja concluído
  
        const client = await getClientById(clientId);
        if (client.business.id !== business.id) {
          console.error('Acesso negado');
          navigate('/clients'); // Redirecione para a página de clientes
          return;
        }
        setClientData(client);
        setClient(client);
      } catch (error) {
        console.error('Error fetching client data:', error);
        navigate('/clients');
      }
    };
  
    if (clientId && !loading && business) {
      fetchClientData(clientId);
    }
  }, [clientId, navigate, loading, business]);

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
    const fetchFiles = async () => {
      if (clientData && clientData.id) {
        const filesList = await getClientFiles(clientData.id);
        setFiles(filesList);
      }
    };

    fetchFiles();
  }, [clientData]);

  useEffect(() => {
    const fetchAllPrograms = async () => {
      if (business && business.id) { // Certifique-se de que o ID do negócio está disponível
        const programsList = await getPrograms(business.id); // Passe o ID do negócio para a função
        setAllPrograms(programsList);
      }
    };
  
    fetchAllPrograms();
  }, [business]);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const validateClient = () => {
    const newErrors = {};
    if (!client.name) newErrors.name = 'Nome é obrigatório';
    if (!client.nickname) newErrors.nickname = 'Apelido é obrigatório';
    if (!client.phone) newErrors.phone = 'Telefone é obrigatório';
    if (!client.email) newErrors.email = 'E-mail é obrigatório';
    if (client.active === undefined) newErrors.status = 'Status é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveClient = async () => {
    if (!validateClient()) return;
    try {
      const { id, ...clientDataToUpdate } = client;
      await updateClient(id, clientDataToUpdate);
      setSuccessMessage('Cliente atualizado com sucesso!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      setModalIsOpen(false);
      setClientData({ ...client, id });
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteProgram = async (clientProgramId) => {
    try {
      const confirmAction = window.confirm("Você tem certeza que deseja excluir este programa?");
      if (confirmAction) {
        await deleteClientProgram(clientData.id, clientProgramId);
        setPrograms(programs.filter(program => program.id !== clientProgramId));
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const calculateStatus = (startDate, lastTaskDay) => {
    const today = new Date();
    if (!startDate) return 'Data Indisponível';
    const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    if (daysPassed < 0) return 'Não Iniciado';
    return daysPassed <= lastTaskDay ? 'Em andamento' : 'Concluído';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Não Iniciado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inativo':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  const calculateCurrentDay = (startDate) => {
    const today = new Date();
    const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return daysPassed + 1;
  };

  const validateGoal = () => {
    const newErrors = {};
    if (!newGoal.goal) newErrors.goal = 'Meta é obrigatória';
    if (!newGoal.deadline || !isValid(new Date(newGoal.deadline))) newErrors.deadline = 'Prazo é obrigatório e deve ser uma data válida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const validateFile = () => {
    const newErrors = {};
    if (!newFile.date || !isValid(new Date(newFile.date))) newErrors.date = 'Data de realização é obrigatória e deve ser uma data válida';
    if (!newFile.file) newErrors.file = 'Arquivo do file é obrigatório';
    if (!newFile.type) newErrors.type = 'Tipo de file é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddFile = async () => {
    if (!validateFile()) return;

    if (clientData && clientData.id) {
      const date = new Date(newFile.date);
      date.setDate(date.getDate() + 1);
      const fileType = newFile.type === 'Outro' ? otherFileType : newFile.type;
      const fileData = { date: Timestamp.fromDate(date), type: fileType, observation: newFile.observation };
      const file = await addClientFile(clientData.id, fileData, newFile.file);
      setFiles([...files, file]);
      setNewFile({ date: "", file: null, type: "", observation: "" });
      setOtherFileType("");
      setFileModalIsOpen(false);
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (clientData && clientData.id) {
      const confirmAction = window.confirm("Você tem certeza que deseja excluir este arquivo?");
      if (confirmAction) {
        await deleteClientFile(clientData.id, fileId, fileName);
        setFiles(files.filter(file => file.id !== fileId));
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

  const checkFileValidity = (fileDate, fileType) => {
    const currentDate = new Date();
    const fileDateObject = fileDate.toDate ? fileDate.toDate() : new Date(fileDate);
    const monthsDifference = differenceInMonths(currentDate, fileDateObject);
    if (fileType === "Biorressonância" || fileType === "Bioimpedância") {
      return monthsDifference <= 6 ? "Válido" : "Inválido";
    }
    return monthsDifference <= 12 ? "Válido" : "Inválido";
  };

  const openSendProgramModal = () => {
    setSendProgramModalIsOpen(true);
  };

  const closeSendProgramModal = () => {
    setSendProgramModalIsOpen(false);
  };

  const handleSendProgram = async () => {
    if (!programStartDate || !selectedProgramToSend) {
      setErrors({
        programStartDate: !programStartDate ? 'Data de início é obrigatória' : '',
        selectedProgramToSend: !selectedProgramToSend ? 'Programa é obrigatório' : '',
      });
      return;
    }

    try {
      const formattedDate = addHours(programStartDate, programStartDate.getTimezoneOffset() / 60);
      const newProgram = await addClientProgram(clientData.id, selectedProgramToSend.id, "9Sti3H8AZL2wnTQT23ff", formattedDate.toISOString());
      const programName = allPrograms.find(program => program.id === selectedProgramToSend.id)?.name || 'Programa Desconhecido';
      const programId = allPrograms.find(program => program.id === selectedProgramToSend.id)?.id || 'Programa Desconhecido';
      const lastTaskDay = await getProgramLastTaskDay(programId);
      const status = calculateStatus(newProgram.startDate, lastTaskDay);
      const currentDay = calculateCurrentDay(newProgram.startDate);
      const programWithDetails = {
        ...newProgram,
        programName,
        lastTaskDay,
        status,
        currentDay
      };
      setPrograms(prevPrograms => [...prevPrograms, programWithDetails]);
      setSendProgramModalIsOpen(false);
    } catch (error) {
      console.error('Erro ao enviar programa:', error);
    }
  };

  const sortData = (data, key, direction) => {
    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortedData;
  };

  const sortedPrograms = useMemo(() => sortConfig.key ? sortData(programs, sortConfig.key, sortConfig.direction) : programs, [programs, sortConfig]);
  const sortedGoals = useMemo(() => sortConfig.key ? sortData(goals, sortConfig.key, sortConfig.direction) : goals, [goals, sortConfig]);
  const sortedFiles = useMemo(() => sortConfig.key ? sortData(files, sortConfig.key, sortConfig.direction) : files, [files, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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
          {clientData ? (
          <div>
            <div className="mb-2">
              <p><strong>Nome:</strong> {clientData.name}</p>
            </div>
            <div className="mb-2">
              <p><strong>Apelido:</strong> {clientData.nickname}</p>
            </div>
            <div className="mb-2">
              <p><strong>Telefone:</strong> {clientData.phone}</p>
            </div>
            <div className="mb-2">
              <p><strong>E-mail:</strong> {clientData.email}</p>
            </div>
            <div className="mb-2">
              <p><strong>Status: </strong> 
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(clientData.active == true ? 'Ativo' : 'Inativo')}`}>
                  {clientData.active == true ? 'Ativo' : 'Inativo'}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <p>Carregando dados do cliente...</p>
        )}
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Arquivos</h2>
            <Button onClick={() => setFileModalIsOpen(true)}>
              Adicionar Arquivo
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Arquivo</TableHead>
                  <TableHead>Data de Realização</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.length > 0 ? (
                  files.map((file) => {
                    const validityStatus = checkFileValidity(file.date, file.type);                    
                    return (
                      <TableRow key={file.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => handleOpenPDF(file.filePath)}>
                        <TableCell>
                          {file.type}
                        </TableCell>
                        <TableCell>{file.date ? format(parseISO(file.date.toDate ? file.date.toDate().toISOString() : file.date), 'dd/MM/yyyy') : 'Data Inválida'}</TableCell>
                        <TableCell>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${validityStatus === 'Válido' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {validityStatus}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <TrashIcon
                            onClick={() => handleDeleteFile(file.id, file.fileName)}
                            className="text-red-500 cursor-pointer"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center">Nenhum arquivo adicionado</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Insights</h2>
          <h2 className="text-6xl font-bold mb-4">Em breve</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-md md:col-span-2 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Programas</h2>
            <Button onClick={openSendProgramModal}>
              Enviar Programa
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Programa</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Dia Atual</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.length > 0 ? (
                  programs.map((program) => {
                    const status = calculateStatus(program.startDate, program.lastTaskDay);
                    const currentDay = calculateCurrentDay(program.startDate);
                    return (
                      <TableRow key={program.id} className="hover:bg-gray-100 cursor-pointer">
                        <TableCell>{program.programName}</TableCell>
                        <TableCell>{program.startDate ? format(parseISO(program.startDate.toDate ? program.startDate.toDate().toISOString() : program.startDate), 'dd/MM/yyyy') : 'Data Inválida'}</TableCell>
                        <TableCell>
                          {currentDay <= 0 ? 'Não iniciado' : (currentDay > program.lastTaskDay ? 'Finalizado' : `${currentDay}º dia`)}
                        </TableCell>
                        <TableCell>{program.lastTaskDay} {program.lastTaskDay === 1 ? 'dia' : 'dias'}</TableCell>
                        <TableCell>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}`}>
                            {status}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <TrashIcon
                            onClick={() => handleDeleteProgram(program.id)}
                            className="text-red-500 cursor-pointer"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center">Nenhum programa ativo</TableCell>
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
          <div className="max-h-48 overflow-y-auto">
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
                    <TableRow 
                      key={goal.id} 
                      className={`hover:bg-gray-100 cursor-pointer ${goal.completed ? 'line-through text-gray-500' : ''}`} 
                      onClick={() => handleUpdateGoal(goal.id, { completed: !goal.completed })}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={goal.completed}
                          onChange={(e) => handleUpdateGoal(goal.id, { completed: e.target.checked })}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>{goal.goal}</TableCell>
                      <TableCell>{goal.deadline ? format(parseISO(goal.deadline.toDate ? goal.deadline.toDate().toISOString() : goal.deadline), 'dd/MM/yyyy') : 'Data Inválida'}</TableCell>
                      <TableCell>
                        <TrashIcon
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGoal(goal.id);
                          }}
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
                  value={client.nickname}
                  onChange={(e) => setClient({ ...client, nickname: e.target.value })}
                />
                {errors.nickname && <p className="text-red-500 text-xs italic">{errors.nickname}</p>}
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Select
                value={statusOptions.find(option => option.value === client.active)}
                onChange={(selectedOption) => setClient({ ...client, active: selectedOption.value })}
                options={statusOptions}
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {errors.status && <p className="text-red-500 text-xs italic">{errors.status}</p>}
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
        isOpen={fileModalIsOpen}
        onRequestClose={() => setFileModalIsOpen(false)}
        contentLabel="Adicionar Arquivo"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">Adicionar Arquivo</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Realização</label>
              <Input
                type="date"
                value={newFile.date}
                onChange={(e) => setNewFile({ ...newFile, date: e.target.value })}
              />
              {errors.date && <p className="text-red-500 text-xs italic">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Arquivo</label>
              <Select
                value={fileOptions.find(option => option.value === newFile.type)}
                onChange={(selectedOption) => setNewFile({ ...newFile, type: selectedOption.value })}
                options={fileOptions}
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {newFile.type === 'Outro' && (
                <Input
                  type="text"
                  value={otherFileType}
                  onChange={(e) => setOtherFileType(e.target.value)}
                  placeholder="Digite o tipo de arquivo"
                  className="mt-2"
                />
              )}
              {errors.type && <p className="text-red-500 text-xs italic">{errors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Arquivo</label>
              <Input
                type="file"
                onChange={(e) => setNewFile({ ...newFile, file: e.target.files[0] })}
              />
              {errors.file && <p className="text-red-500 text-xs italic">{errors.file}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Observação</label>
              <Input
                type="text"
                value={newFile.observation}
                onChange={(e) => setNewFile({ ...newFile, observation: e.target.value })}
                placeholder="Observação"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setFileModalIsOpen(false)} variant="secondary" className="mr-2">
                Cancelar
              </Button>
              <Button onClick={handleAddFile}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={sendProgramModalIsOpen}
        onRequestClose={closeSendProgramModal}
        contentLabel="Enviar Programa"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4">Enviar Programa</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
            <DatePickerDemo selectedDate={programStartDate} setSelectedDate={setProgramStartDate} />
            {errors.programStartDate && <p className="text-red-500 text-xs italic">{errors.programStartDate}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Selecione um Programa</label>
            <Select
              placeholder="Selecionar"
              options={allPrograms.map(program => ({ value: program.id, label: program.name }))}
              onChange={(selectedOption) => {
                const selectedProgram = allPrograms.find(program => program.id === selectedOption.value);
                setSelectedProgramToSend(selectedProgram);
              }}
            />
            {errors.selectedProgramToSend && <p className="text-red-500 text-xs italic">{errors.selectedProgramToSend}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={closeSendProgramModal}>
              Cancelar
            </Button>
            <Button onClick={handleSendProgram}>
              Enviar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Kanban;
