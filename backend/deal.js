const express = require('express');
const multer=require('multer');
const fs=require('fs');
const path=require('path');
const jwt=require('jsonwebtoken');
const Deal = require('./models/Deal');
const User=require('./models/User')
const router = express.Router();





const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
    
});

const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt|xlsx/;

const fileFilter = (req, file, cb) => {
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isValid) cb(null, true);
  else cb(new Error('Unsupported file type'));
};

const upload = multer({ storage, fileFilter }); // <-- Add this


function verifyToken(req,res,next){
    const token = req.headers.authorization?.split(' ')[1];

    if(!token) return res.status(403).send({error:'No token provided'});

    jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err) return res.status(403).send({error:'Failed to authenticate token'});
        req.userId= decoded.userId;
        req.userRole=decoded.role;
        next();
    });

}
router.post('/create', async (req, res) => {
    const { title, description, price, buyerId, sellerId } = req.body;

    try {
        const deal = new Deal({ title, description, price, buyer: buyerId, seller: sellerId });
        await deal.save();
        res.json({ message: 'Deal created successfully', deal });
    } catch (err) {
        res.status(500).json({ error: 'Deal creation failed' });
    }
});

router.get('/:dealId', async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.dealId).populate('buyer').populate('seller');
        if (!deal) return res.status(404).json({ error: 'Deal not found' });
        res.json(deal);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching deal' });
    }
});
router.post('/upload/:dealId', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const deal = await User.findById(req.params.dealId);
        if (!deal) return res.status(404).send({ error: 'Deal not found' });

        if (deal.buyer.toString() !== req.userId && deal.seller.toString() !== req.userId) {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        const filePath = req.file.path;
        const fileName = req.file.filename;

        if (!deal.documents) deal.documents = [];
        deal.documents.push({ filePath, fileName, uploadedBy: req.userId });

        await deal.save();

        res.status(200).send({ message: 'File uploaded successfully', fileName });
    } catch (err) {
        console.error('Upload error:', err);  // <-- Add this
        res.status(500).send({ error: 'Error uploading file' });
    }
    
});

// Download file
router.get('/download/:dealId/:fileName', verifyToken, async (req, res) => {
    try {
        const deal = await Deal.findById(req.params.dealId);
        if (!deal) return res.status(404).send({ error: 'Deal not found' });

        const file = deal.documents.find(doc => doc.fileName === req.params.fileName);
        if (!file) return res.status(404).send({ error: 'File not found' });

        if (deal.buyer.toString() !== req.userId && deal.seller.toString() !== req.userId) {
            return res.status(403).send({ error: 'Unauthorized' });
        } 

        res.download(path.resolve(file.filePath));
    } catch (err) {
        res.status(500).send({ error: 'Error downloading file' });
    }
});

module.exports = router;
