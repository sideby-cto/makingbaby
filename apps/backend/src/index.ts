import express from 'express';

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

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
