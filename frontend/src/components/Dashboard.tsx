import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent } from './ui/card';
import Button from './ui/button';
import { Separator } from './ui/separator';

interface DaashboardProps {
  deal_id: string;
}
const Dashboard: React.FC<DaashboardProps> = ({deal_id}) => {
  const [message, setMessage] = useState<string>('');
  const [userRole, setUserRole] = useState<string>(''); // Store role for navigation
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('http://localhost:3000/protected', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMessage(res.data.message);
        setUserRole(res.data.role); // assuming backend sends user role
      } catch (error) {
        alert('Access denied! Please login.');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleGoToDealRoom = () => {
    navigate(`/dealroom/${deal_id}`, { state: { userRole: userRole || 'Buyer' } });

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border border-border p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <Separator />
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">{message}</p>
          <Button className="w-full" onClick={handleGoToDealRoom}>
            Go to Deal Room
          </Button>
          <Button className="w-full" variant="link" onClick={handleLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
