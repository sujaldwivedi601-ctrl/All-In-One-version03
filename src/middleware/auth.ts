import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
  } catch (error: any) {
    // If token expired or invalid, log a clean note and proceed without req.user
    if (error?.code === 'auth/id-token-expired') {
      console.warn('Optional auth: Firebase ID token has expired.');
    } else {
      console.warn('Optional auth token verification failed:', error?.message || error);
    }
  }
  next();
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    if (error?.code === 'auth/id-token-expired') {
      console.warn('requireAuth: Firebase ID token has expired, returning token_expired');
      return res.status(401).json({ 
        error: 'Unauthorized: Token expired', 
        code: 'auth/id-token-expired' 
      });
    }
    console.error('Error verifying Firebase ID token:', error?.message || error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
