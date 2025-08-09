import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || username.trim() === '' || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  if (username === 'admin' && password === 'password') {
    return res.json({ message: 'Login successful' });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
