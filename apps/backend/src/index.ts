import express from 'express';
import storiesRouter from './stories';

import mongoose from 'mongoose';
import { config } from './config';

// Reuse compiled schemas from the existing NestJS app
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { UserSchema } = require('../../babymakin/app-master/dist/user/entities/user.entity.js');

mongoose
  .connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: unknown) => console.error('MongoDB connection error:', err));

mongoose.model('User', UserSchema);

const app = express();
const port = config.port;

app.use(express.json());
app.use('/auth', authRouter);

app.use(express.json());

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

app.use('/api/stories', storiesRouter);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
