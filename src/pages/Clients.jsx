import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { slug } from '../utils/slug';
import { Button } from "@/components/ui/button"; // Adicione esta linha para importar o Button do shadcn

// Defina o elemento principal do aplicativo para o modal
Modal.setAppElement('#root');

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
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
        const clientDoc = doc(db, "clients", selectedClient.id);
        await updateDoc(clientDoc, {
          name: selectedClient.name,
          phone: selectedClient.phone,
          email: selectedClient.email,
          status: selectedClient.status,
          program: selectedClient.program,
          class: selectedClient.class,
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

  const handleDelete = async (clientId) => {
    try {
      await deleteDoc(doc(db, "clients", clientId));
      setClients(clients.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const confirmDelete = (clientId) => {
    const confirmAction = window.confirm("Você tem certeza que deseja excluir este cliente?");
    if (confirmAction) {
      handleDelete(clientId);
    }
  };

  const handleKanbanOpen = (client) => {
    const slugName = slug(client.name);
    navigate(`/clients/${slugName}`, { state: { clientData: client } });
  };

  const handleAddClient = () => {
    navigate('/clients/new');
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={handleAddClient} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
          Adicionar Cliente
        </Button>
      </div>
      {successMessage && <div className="text-green-500">{successMessage}</div>}
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Programa
            </TableHead>
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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {client.status === 1 ? 'Ativo' : 'Inativo'}
                </span>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {client.program}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handleKanbanOpen(client)} className="text-indigo-600 hover:text-indigo-900">
                  Dashboard
                </button>
                <button onClick={() => confirmDelete(client.id)} className="text-red-600 hover:text-red-900 ml-4">
                  Excluir
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Clients;
