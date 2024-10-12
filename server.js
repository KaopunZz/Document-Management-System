const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Initialize Firebase Admin SDK
const serviceAccount = require('./saur-f6861-firebase-adminsdk-aj9vx-53ccad067f.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/documents', async (req, res) => {
  try {
    console.log('Received POST request:', req.body);
    const { topic, writer, content } = req.body;
    const docRef = await db.collection('documents').add({ topic, writer, content });
    console.log('Document saved successfully:', docRef.id);
    res.status(201).json({ id: docRef.id, topic, writer, content });
  } catch (err) {
    console.error('Error saving document:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const snapshot = await db.collection('documents').get();
    const documents = [];
    snapshot.forEach(doc => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    console.log('Successfully fetched documents, count:', documents.length);
    res.status(200).json(documents);
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/documents/:id', async (req, res) => {
  try {
    const { topic, writer, content } = req.body;
    await db.collection('documents').doc(req.params.id).update({ topic, writer, content });
    res.status(200).json({ id: req.params.id, topic, writer, content });
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    await db.collection('documents').doc(req.params.id).delete();
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});