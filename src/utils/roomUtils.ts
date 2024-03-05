import jwt from 'jsonwebtoken';

export interface DecodedToken {
  password: string;
}

export const generateRoomPasswordToken = async (password: string): Promise<string> => {
  const expirationDate = new Date('9999-12-31T23:59:59Z');
  const token = jwt.sign({ password }, process.env.ROOM_SECRET, { expiresIn: expirationDate.getTime() / 1000 });
  return token;
};

export function verifyPasswordToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.ROOM_SECRET) as DecodedToken;
    return decoded?.password;
  } catch (error) {
    return null;
  }
}
