import express from 'express';
import storiesRouter from './stories';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.use('/api/stories', storiesRouter);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
