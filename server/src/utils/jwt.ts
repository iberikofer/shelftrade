import jwt from 'jsonwebtoken';
import { JwtUserPayload } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET || 'shelftrade-super-secret-jwt-key';

export const signToken = (
  payload: JwtUserPayload,
  expiresIn: string | number = '7d',
): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
};

export const signPasswordResetToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email, purpose: 'reset-password' }, JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const verifyPasswordResetToken = (
  token: string,
): { id: string; email: string; purpose: string } => {
  const payload = jwt.verify(token, JWT_SECRET) as {
    id: string;
    email: string;
    purpose: string;
  };
  if (payload.purpose !== 'reset-password') {
    throw new Error('Invalid token purpose');
  }
  return payload;
};
