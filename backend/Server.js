const express = require('express');
const http= require('http');
const jwt=require('jsonwebtoken');
const mongoose = require('mongoose');
const {Server} = require('socket.io')
const cors = require('cors');
const authRoutes = require('./Routes');
const deals=require('./deal')
const dealRoutes=require('./models/Deal');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));

app.use(authRoutes);
const server= http.createServer(app);
const io = new Server(server,{cors:{origin:'*'}})
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/auth', authRoutes);  
app.use('/deals', dealRoutes); 
app.use('/api',deals) 


const activeDeals={};

io.on('connection',(socket)=>{
  console.log('New User connected');

  socket.on('joinRoom',(dealId)=>{
    socket.join(dealId);
    if(!activeDeals[dealId]) activeDeals[dealId]={messages:[],currentPrice:0};
    console.log(`Joined room:${dealId}`);
  })
  socket.on('sendMessage',({dealId,message})=>{
    activeDeals[dealId].messages.push(message);
    io.to(dealId).emit('message',message);
  });

  socket.on('updatePrice',({dealId,price})=>{
    activeDeals[dealId].currentPrice=price;
    io.to(dealId).emit('priceUpdate',price);
  });

  socket.on('disconnect',()=>{
    console.log('Client disconnected');
  });
})

io.use((socket,next)=>{
  const token=socket.handshake.auth.token;
  if(!token){
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));

    socket.user = decoded;
    next();
});

})
// Start Server
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
