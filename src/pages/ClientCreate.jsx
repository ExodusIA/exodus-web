import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { addClient } from '../services/clientService';
import { getGroups } from '../services/groupService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBusiness } from '@/contexts/BusinessContext';
import Select from 'react-select';

const AddClient = () => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [groups, setGroups] = useState([]); // Lista de grupos do negócio
  const [selectedGroups, setSelectedGroups] = useState([]); // Grupos selecionados
  const navigate = useNavigate();
  const { business, loading } = useBusiness();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const businessGroups = await getGroups(business.id);
        setGroups(businessGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    if (business && business.id) {
      fetchGroups();
    }
  }, [business]);

  const handleSave = async () => {
    try {
      await addClient({
        name,
        nickname,
        phone: phone.replace(/\D/g, ''), // Remover a máscara antes de salvar
        email,
        business: business.id,
        groups: selectedGroups.map(group => group.value),
        active: true,
      });
      navigate('/clients');
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const groupOptions = groups.map(group => ({
    value: group.id,
    label: group.name
  }));

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
        <label className="block text-sm font-medium text-gray-700">Apelido</label>
        <Input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Telefone</label>
        <InputMask
          mask="+55 (99) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maskChar={null}
        >
          {() => <Input
            type="text"
            placeholder="Digite o telefone"
          />}
        </InputMask>
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
        <label className="block text-sm font-medium text-gray-700">Grupos</label>
        <Select
          isMulti
          options={groupOptions}
          value={selectedGroups}
          onChange={setSelectedGroups}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
        />
      </div>
      <Button onClick={handleSave}>
        Salvar
      </Button>
    </div>
  );
};

export default AddClient;
