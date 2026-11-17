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
