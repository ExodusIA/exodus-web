import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import Modal from 'react-modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { slug } from '../utils/slug';

// Defina o elemento principal do aplicativo para o modal
Modal.setAppElement('#root');

const statusOptions = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Inativo', label: 'Inativo' },
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
  // Adicione outras opções conforme necessário
];

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.baserow.io/api/database/rows/table/302737/?user_field_names=true', {
          headers: {
            Authorization: `Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL` // Use a variável de ambiente
          }
        });
        setClients(response.data.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const openModal = (client) => {
    setSelectedClient(client);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedClient(null);
  };

  const handleSave = async () => {
    if (selectedClient) {
      try {
        const payload = {
          name: selectedClient.name,
          phone: selectedClient.phone,
          email: selectedClient.email,
          status: selectedClient.status?.value,
          program: selectedClient.program?.value,
          class: selectedClient.class?.value,
        };
  
        console.log('Payload:', payload); // Para depuração
  
        await axios.patch(`https://api.baserow.io/api/database/rows/table/302737/${selectedClient.id}/?user_field_names=true`, payload, {
          headers: {
            Authorization: 'Token ksKlG2r9Ezpl22Sk2kBgATPFHZgIhyrL'
          }
        });
  
        setClients(clients.map(client => (client.id === selectedClient.id ? selectedClient : client)));
        closeModal();
        setSuccessMessage('Cliente atualizado com sucesso!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error updating client:', error);
      }
    }
  };

  const handleKanbanOpen = (client) => {
    const slugName = slug(client.name);
    navigate(`/clients/${slugName}`, { state: { clientData: client } });
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      {successMessage && <div className="text-green-500">{successMessage}</div>}
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</TableHead>
            <TableHead className="px-6 py-3"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-gray-50">
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <button onClick={() => handleKanbanOpen(client)} className="text-blue-600 hover:text-blue-900">
                  {client.name}
                </button>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status?.value === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {client.status?.value}
                </span>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">{client.program?.value}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => openModal(client)} className="text-indigo-600 hover:text-indigo-900">
                  Editar
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

  
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Editar Cliente"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4">Editar Cliente</h2>
          {selectedClient && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={selectedClient.name}
                  onChange={(e) => setSelectedClient({ ...selectedClient, name: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={selectedClient.phone}
                  onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded"
                  value={selectedClient.email}
                  onChange={(e) => setSelectedClient({ ...selectedClient, email: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={statusOptions.find(option => option.value === selectedClient.status?.value)}
                  onChange={(selectedOption) => setSelectedClient({ ...selectedClient, status: { value: selectedOption.value } })}
                  options={statusOptions}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Programa</label>
                <Select
                  value={programOptions.find(option => option.value === selectedClient.program?.value)}
                  onChange={(selectedOption) => setSelectedClient({ ...selectedClient, program: { value: selectedOption.value } })}
                  options={programOptions}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Turma</label>
                <Select
                  value={classOptions.find(option => option.value === selectedClient.class?.value)}
                  onChange={(selectedOption) => setSelectedClient({ ...selectedClient, class: { value: selectedOption.value } })}
                  options={classOptions}
                />
              </div>
              <div className="flex justify-end">
                <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                  Cancelar
                </button>
                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Salvar
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
  
};

export default Clients;
