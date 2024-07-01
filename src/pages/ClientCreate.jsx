import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const AddClient = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(1);
  const [program, setProgram] = useState('');
  const [classGroup, setClassGroup] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      await addDoc(collection(db, "clients"), {
        name,
        phone,
        email,
        status,
        program,
        class: classGroup
      });
      navigate('/clients');
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Adicionar Cliente</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Telefone</label>
        <Input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">E-mail</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value={1}>Ativo</option>
          <option value={0}>Inativo</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Programa</label>
        <Input
          type="text"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Turma</label>
        <Input
          type="text"
          value={classGroup}
          onChange={(e) => setClassGroup(e.target.value)}
        />
      </div>
      <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
        Salvar
      </Button>
    </div>
  );
};

export default AddClient;
