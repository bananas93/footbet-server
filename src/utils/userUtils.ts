import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { type IncomingHttpHeaders } from 'http';

export interface DecodedToken {
  id: string;
}

export const getUserIdFromToken = (headers: IncomingHttpHeaders): string | null => {
  try {
    const token = headers.authorization?.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    return decoded.id;
  } catch (error) {
    return null;
  }
};

export const getUserIdFromRefreshToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    return decoded.id;
  } catch (error) {
    return null;
  }
};

export const createPasswordHash = (password: string): string => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

export const generateAccessToken = async (id: number | string): Promise<string> => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return accessToken;
};

export const generateRefreshToken = async (id: number | string): Promise<string> => {
  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  return refreshToken;
};

export const checkEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const checkPassword = (password: string): boolean => {
  const isLongEnough = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasLowerCaseLetter = /[a-z]/.test(password);
  return isLongEnough && hasNumber && hasCapitalLetter && hasLowerCaseLetter;
};
