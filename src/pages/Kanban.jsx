import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import Modal from 'react-modal';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClientPrograms, updateClient, deleteClientProgram } from '../firebase/firebaseServices';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const Kanban = () => {
  const location = useLocation();
  const { clientData: initialClientData } = location.state;
  const [clientData, setClientData] = useState(initialClientData);
  const [programs, setPrograms] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [client, setClient] = useState(initialClientData);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleSaveClient = async () => {
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
    const startDate = new Date(assignedDate);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Sobre Você</h2>
          <p><strong>Nome:</strong> {clientData.name}</p>
          <p><strong>Apelido:</strong> {clientData.nickName}</p>
          <p><strong>Telefone:</strong> {clientData.phone}</p>
          <p><strong>E-mail:</strong> {clientData.email}</p>
          <p><strong>Status: </strong> 
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(clientData.status === 1 ? 'Ativo' : 'Inativo')}`}>
              {clientData.status === 1 ? 'Ativo' : 'Inativo'}
            </span>
          </p>
          <Button onClick={openModal} className="mt-4">
            Editar Cliente
          </Button>
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Exames</h2>
          {/* Lógica para exibir exames */}
        </div>
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Resultados e Reflexões</h2>
          {/* Lógica para exibir resultados e reflexões */}
        </div>
      </div>
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Programas</h2>
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
                      <TableCell>{program.assignedDate ? new Date(program.assignedDate).toLocaleDateString('pt-BR') : 'Data Inválida'}</TableCell>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apelido</label>
                <Input
                  type="text"
                  value={client.nickName}
                  onChange={(e) => setClient({ ...client, nickName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <Input
                type="text"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <Input
                type="email"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
              />
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
    </div>
  );
};

export default Kanban;