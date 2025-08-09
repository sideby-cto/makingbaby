import crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';

export interface User {
  email: string;
  password: string;
  fullName: string;
}

const users: User[] = [];

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createUser(dto: CreateUserDto): Promise<User> {
  const user: User = {
    email: dto.email,
    password: hashPassword(dto.password),
    fullName: dto.fullName,
  };
  users.push(user);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
