import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('Falha ao entrar. Por favor, verifique seu email e senha.');
      console.error('Erro ao entrar:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-sm mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Exodus</h1>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-semibold">Entrar na sua conta</CardTitle>
            <CardDescription className="text-center text-sm text-muted-foreground">
              Digite seu email e senha para entrar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="w-full"
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
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-center">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full">Entrar</Button>
              </div>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Não tem uma conta? <a href="/register" className="text-blue-500 underline">Registrar</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
