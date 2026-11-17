export interface JwtUserPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

