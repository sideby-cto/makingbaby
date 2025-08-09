import express from 'express';
import authRouter from './auth/auth.controller';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/auth', authRouter);

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
