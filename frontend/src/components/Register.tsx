import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import  Button  from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useNavigate } from 'react-router-dom';

interface FormData {
  username: string;
  email: string;
  password: string;
  role: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    role: 'Buyer',
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/auth/register', formData);
      alert(res.data.message);
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border border-border p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            </div>

            <div>
              <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium"> Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
>
    <option value="Buyer">Buyer</option>
    <option value="Seller">Seller</option>
  </select>
</div>

            </div>

            <Button type="submit" className="w-full">
              Register
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="underline hover:text-primary">
                Login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
