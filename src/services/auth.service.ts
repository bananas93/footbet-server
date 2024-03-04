/* eslint-disable no-param-reassign */
import jwt, { type JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { AppDataSource } from '../config/db';
import { User } from '../entity/User';
import {
  checkEmail,
  checkPassword,
  createPasswordHash,
  generateAccessToken,
  generateRefreshToken,
} from '../utils/userUtils';
import { type Repository } from 'typeorm';

class AuthService {
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUser(data: Record<string, any>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const userExists = await this.userRepository.findOne({ where: { email: data.email } });
      if (userExists) {
        throw new Error('User already exists');
      }
      const isValidEmail = checkEmail(data.email);
      if (!isValidEmail) {
        throw new Error('Invalid email');
      }
      const isValidPassword = checkPassword(data.password);
      if (!isValidPassword) {
        throw new Error(
          'Password must be at least 8 characters long containing at least one number and one capital letter',
        );
      }
      const hash = createPasswordHash(data.password);
      data.password = hash;
      const user = this.userRepository.create(data);
      await this.userRepository.save(user);
      const accessToken = await generateAccessToken(user.id);
      const refreshToken = await generateRefreshToken(user.id);
      return { accessToken, refreshToken };
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async loginUser(data: Record<string, any>): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const user = await this.userRepository.findOne({ where: { email: data.email } });
      if (!user) {
        throw new Error('User not found');
      }
      const validPassword = bcrypt.compareSync(data.password, user.password);
      if (!validPassword) {
        throw new Error('Invalid password');
      }
      const accessToken = await generateAccessToken(user.id);
      const refreshToken = await generateRefreshToken(user.id);
      return { accessToken, refreshToken };
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async editUser(id: number, data: Record<string, any>): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }
      if (data.password) {
        const isValidPassword = checkPassword(data.password);
        if (!isValidPassword) {
          throw new Error(
            'Password must be at least 8 characters long containing at least one number and one capital letter',
          );
        }
        const hash = createPasswordHash(data.password);
        data.password = hash;
      }
      await this.userRepository.update({ id }, data);
      const editedUser = await this.userRepository.findOne({ where: { id } });
      return editedUser;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async forgotPassword(email: string): Promise<string> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }
      const resetToken = crypto.randomBytes(32).toString('hex');

      const data = {
        resetToken,
      };
      await this.userRepository.update({ email }, data);
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'amerovdavid@gmail.com',
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: 'amerovdavid@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${process.env.CLIENT_URL}/login/reset-password?token=${resetToken}`,
      };

      await transporter.sendMail(mailOptions);
      return 'Password reset email sent';
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async changePassword(token: string, password: string): Promise<string> {
    try {
      if (!token) {
        throw new Error('Invalid token');
      }
      const user = await this.userRepository.findOne({ where: { resetToken: token } });
      if (!user) {
        throw new Error('Invalid token or token expired');
      }
      const isValidPassword = checkPassword(password);
      if (!isValidPassword) {
        throw new Error(
          'Password must be at least 8 characters long containing at least one number and one capital letter',
        );
      }
      const hash = createPasswordHash(password);
      const data = {
        password: hash,
        resetToken: null,
      };
      await this.userRepository.update({ resetToken: token }, data);
      return 'Password reset successfully';
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async checkResetToken(token: string): Promise<string> {
    try {
      if (!token) {
        throw new Error('Invalid token');
      }
      const user = await this.userRepository.findOne({ where: { resetToken: token } });
      if (!user) {
        throw new Error('Invalid token or token expired');
      }
      return 'Token is valid';
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async getUser(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }
      await this.userRepository.delete({ id });
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async authGoogleUser(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = await generateAccessToken(user.id);
      const refreshToken = await generateRefreshToken(user.id);
      return { accessToken, refreshToken };
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async createOrFindGoogleUser(profile: Record<string, any>): Promise<User> {
    try {
      const { displayName, id, emails, photos } = profile;
      const email = emails[0].value;
      const photo = photos[0].value;
      const user: User = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        await this.userRepository.save({ name: displayName, googleId: id, email, photo });
      }
      await this.userRepository.update({ email }, { googleId: id });
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async refreshAccessToken(refreshToken: string, userId: number): Promise<string> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      const decoded: JwtPayload = jwt.verify(refreshToken, process.env.JWT_SECRET) as JwtPayload;
      const accessToken = generateAccessToken(decoded.id);
      return await accessToken;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new AuthService();
