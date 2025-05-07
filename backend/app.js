const express = require('express');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redisClient = require('./redisClient');
const http = require('http');
const { Server } = require('socket.io'); // Fixed typo here
const fs = require('fs');
const path = require('path');
const { authenticateSocket } = require('./authmiddle');
const upload = require('./fileUploadMiddleware'); // Ensure you have this middleware implemented

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Fixed typo `ap` to `app`

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.JWT_SECRET || 'default_secret', // Added fallback for secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to authenticate socket connections
io.use(authenticateSocket(redisClient));

io.on('connection', (socket) => {
    console.log('New User Connected');

    socket.on('joinRoom', (dealId) => {
        socket.join(dealId);
        console.log(`User joined room: ${dealId}`);
    });

    socket.on('sendMessage', ({ dealId, message }) => {
        io.to(dealId).emit('message', message);

        // Save message to Redis
        redisClient.lPush(`messages:${dealId}`, JSON.stringify(message));
    });

    socket.on('updatePrice', ({ dealId, price }) => {
        io.to(dealId).emit("priceUpdate", price);

        // Save price to Redis
        redisClient.set(`price:${dealId}`, price.toString());
    });

    socket.on('disconnect', () => { // Removed `socket` argument here, it's already in scope
        console.log('User disconnected');
    });
});

// File Upload Endpoint
app.post('/api/deals/upload/:dealId', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    
    const filePath = `/uploads/${req.file.filename}`;
    
    // Store uploaded file details in Redis
    redisClient.lPush(`files:${req.params.dealId}`, req.file.filename);
  
    res.status(200).json({ message: 'File uploaded successfully', filePath });
});

// File Download Endpoint
app.get('/api/deals/downloads/:dealId/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    if (fs.existsSync(file)) {
        res.download(file);
    } else {
        res.status(404).send('File not found');
    }
});

// Retrieve Messages
app.get('/api/deals/:dealId/messages', async (req, res) => {
    const messages = await redisClient.lRange(`messages:${req.params.dealId}`, 0, -1);
    res.status(200).json(messages.map(msg => JSON.parse(msg)));
});

// Retrieve Active Price
app.get('/api/deals/:dealId/price', async (req, res) => {
    const price = await redisClient.get(`price:${req.params.dealId}`);
    res.status(200).json({ currentPrice: price ? parseFloat(price) : 0 });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
