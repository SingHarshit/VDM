import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import  Button  from './ui/button';
import { Separator } from './ui/separator';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {

      const res = await axios.post('http://localhost:3000/auth/login', formData);
    
      // Save token to localStorage
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('id', res.data.user_id)
        alert(res.data.token);
        console.log('redirecting...')
        navigate('/dashboard');
      } else {
        alert('Invalid response from server. Token not received.');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Login failed. Please try again.';
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-6 space-y-4 shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Login</h1>
        </div>
        <Separator />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
