import { Router } from 'express';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { createUser, findUserByEmail, verifyPassword } from '../user/user.service';
import { generateToken } from './auth.service';

const router = Router();

router.post('/register', async (req, res) => {
  const dto: CreateUserDto = req.body;
  if (findUserByEmail(dto.email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await createUser(dto);
  const token = generateToken(user);
  res.json({ token });
});

router.post('/login', async (req, res) => {
  const dto: LoginDto = req.body;
  const user = findUserByEmail(dto.email);
  if (!user || !verifyPassword(dto.password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(user);
  res.json({ token });
});

export default router;
