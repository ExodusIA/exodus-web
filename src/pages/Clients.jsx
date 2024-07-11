"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { slug } from '../utils/slug';
import { TrashIcon } from '@radix-ui/react-icons';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filteredClients, setFilteredClients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
        setFilteredClients(clientsList);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const results = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(results);
  }, [searchTerm, clients]);

  const sortClients = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    const sortedClients = [...filteredClients].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key, direction });
    setFilteredClients(sortedClients);
  };

  const handleDeleteClient = async (id) => {
    const confirmAction = window.confirm("Você tem certeza que deseja excluir este cliente?");
    if (confirmAction) {
      await deleteDoc(doc(db, "clients", id));
      setClients(clients.filter(client => client.id !== id));
      setFilteredClients(filteredClients.filter(client => client.id !== id));
    }
  };

  const handleKanbanOpen = (client) => {
    navigate(`/clients/${slug(client.name)}`, { state: { clientData: client } });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <Button onClick={() => navigate('/clients/new')} className="mr-4">
          Adicionar Cliente
        </Button>
      </div>
      <Input
        type="text"
        placeholder="Pesquisar Clientes"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full md:w-1/3"
      />
      <div className="overflow-x-auto">
        <Table className="w-full bg-white shadow rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-2 text-left cursor-pointer" onClick={() => sortClients('name')}>
                Nome {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
              </TableHead>
              <TableHead className="px-4 py-2 text-left cursor-pointer" onClick={() => sortClients('status')}>
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
              </TableHead>
              <TableHead className="px-4 py-2 text-left cursor-pointer" onClick={() => sortClients('program')}>
                Programa {sortConfig.key === 'program' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
              </TableHead>
              <TableHead className="px-4 py-2 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map(client => (
              <TableRow key={client.id} className="text-left border-t hover:bg-gray-100 cursor-pointer" onClick={() => handleKanbanOpen(client)}>
                <TableCell className="px-4 py-2">
                  {client.name}
                </TableCell>
                <TableCell className="px-4 py-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {client.status === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-2">{client.program}</TableCell>
                <TableCell className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteClient(client.id)}>
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Clients;
