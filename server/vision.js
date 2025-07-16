const express = require('express');
const vision = require('@google-cloud/vision');
const multer = require('multer');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

// Initialize Firebase Admin SDK with the default compute service account
admin.initializeApp({
  credential: admin.credential.cert('./expense-analyse-ee81d-d1ef5abb29be.json'),
  databaseURL: 'https://expense-analyse-ee81d-default-rtdb.firebaseio.com'
});

// Set up Google Vision client with the same default compute service account
const client = new vision.ImageAnnotatorClient({
  keyFilename: './expense-analyse-ee81d-d1ef5abb29be.json'
});

// OCR endpoint
app.post('/api/ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const [result] = await client.textDetection(req.file.buffer);
    const detections = result.textAnnotations;
    res.json({ text: detections[0]?.description || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Firebase Realtime Database operations
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, transaction } = req.body;
    const db = admin.database();
    const ref = db.ref(`users/${userId}/transactions`);
    const newTransactionRef = ref.push();
    await newTransactionRef.set(transaction);
    res.json({ id: newTransactionRef.key, ...transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = admin.database();
    const ref = db.ref(`users/${userId}/transactions`);
    const snapshot = await ref.once('value');
    const transactions = snapshot.val() || {};
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Vision OCR & Firebase server running on port ${PORT} with default compute service account`)); 