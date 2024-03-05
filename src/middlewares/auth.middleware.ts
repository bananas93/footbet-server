import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response<any, Record<string, any>>> => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Access Denied. No token provided.' });
  }

  const tokenParts = authorization.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(403).json({ error: 'Access Denied. Invalid token format.' });
  }

  const token = tokenParts[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(403).json({ error: 'Access Denied. Invalid token content.' });
    }

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access Denied. Token expired.' });
    }
    return res.status(401).json({ error: error.message || 'Access Denied. Invalid or expired access token.' });
  }
};

export default checkAuth;
