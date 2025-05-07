import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import Button from './ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import ScrollArea from '../components/ui/scroll-area';
import Progress from '../components/ui/progress';

const socket: Socket = io('http://localhost:3000', { autoConnect: false });

interface Message {
  sender: string;
  text: string;
}

interface DealRoomProps {
  dealId: string;
  userRole: 'Buyer' | 'Seller';
}

const DealRoom: React.FC<DealRoomProps> = ({ dealId, userRole }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You need to be logged in to access this room');
      return;
    }

    socket.auth = { token };
    socket.connect();

    socket.emit('joinRoom', dealId);

    socket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('priceUpdate', (newPrice: number) => {
      setCurrentPrice(newPrice);
    });

    return () => {
      socket.disconnect();
    };
  }, [dealId]);

  const sendMessage = () => {
    const message: Message = { sender: userRole, text: messageInput };
    socket.emit('sendMessage', { dealId, message });
    setMessageInput('');
  };

  const updatePrice = () => {
    socket.emit('updatePrice', { dealId, price });
    setCurrentPrice(price);
    setPrice(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `http://localhost:3000/api/upload/${dealId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percent);
          },
        }
      );

      alert(response.data.message);
      setUploadedFiles(prev => [...prev, selectedFile.name]);
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      alert('File upload failed');
      setUploadProgress(0);
    }
  };

  const downloadFile = async (fileName: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `http://localhost:3000/api/deals/download/${dealId}/${fileName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Download failed');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader title="Deal Room" />
        <CardContent className="space-y-4">
          {/* Messages Section */}
          <div>
            <h3 className="text-xl font-bold">Messages</h3>
            <ScrollArea className="h-64 border p-2 rounded-lg mb-2">
              {messages.map((msg, index) => (
                <div key={index} className="mb-1">
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))}
            </ScrollArea>
            <div className="flex space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>

          <Separator />

          {/* Price Negotiation Section */}
          <div>
            <h3 className="text-xl font-bold">Price Negotiation</h3>
            <div>Current Price: ${currentPrice}</div>
            {userRole === 'Buyer' && (
              <div className="flex space-x-2 mt-2">
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Propose a price"
                />
                <Button onClick={updatePrice}>Propose Price</Button>
              </div>
            )}
          </div>

          <Separator />

          {/* File Upload Section */}
          <div>
            <h3 className="text-xl font-bold">File Upload</h3>
            <Input type="file" onChange={handleFileChange} />
            <Button className="mt-2" onClick={handleFileUpload}>
              Upload File
            </Button>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <Progress value={uploadProgress} max={100} />
                <p className="text-sm mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {/* Uploaded Files Section */}
            <h3 className="mt-4 text-xl font-bold">Uploaded Files</h3>
            <ul className="space-y-1">
              {uploadedFiles.map((fileName, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{fileName}</span>
                  <Button variant="link" onClick={() => downloadFile(fileName)}>
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealRoom;
