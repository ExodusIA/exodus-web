import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import InputMask from 'react-input-mask';
import { addBusiness } from '@/services/businessService';
import { useBusiness } from '@/contexts/BusinessContext';

const Register = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const { business, loading, setBusiness } = useBusiness();

  useEffect(() => {
    if (!loading && business) {
      navigate('/');
    }
  }, [loading, business, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message

    // Validação básica de e-mail e telefone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido.');
      return;
    }

    // Validação do telefone com base na máscara
    const phoneRegex = /^\+55 \(\d{2}\) \d{5}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      setError('Telefone inválido.');
      return;
    }

    // Remover a máscara do telefone para armazenar no banco de dados
    const phoneWithoutMask = phone.replace(/\D/g, '');

    try {
      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Dados do negócio
      const businessData = {
        name,
        description,
        email,
        phone: phoneWithoutMask
      };

      // Criar documento do negócio no Firestore
      await addBusiness(user.uid, businessData);

      // Atualizar o contexto do negócio
      setBusiness({ id: user.uid, ...businessData });

      navigate('/');
    } catch (error) {
      setError('Erro ao criar usuário. Por favor, verifique seus dados.');
      console.error('Erro ao criar usuário:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-sm mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Exodus</h1>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-semibold">Criar uma nova conta</CardTitle>
            <CardDescription className="text-center text-sm text-muted-foreground">
              Digite seus dados para registrar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleRegister}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Nome do Negócio</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite o nome do negócio"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Digite a descrição do negócio"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <InputMask
                    mask="+55 (99) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maskChar={null}
                  >
                    {() => <Input
                      id="phone"
                      type="tel"
                      placeholder="Digite o telefone do negócio"
                      className="w-full"
                      required
                    />}
                  </InputMask>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full"
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-center">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full">Registrar</Button>
              </div>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Já tem uma conta? <a href="/login" className="text-blue-500 underline">Entrar</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
