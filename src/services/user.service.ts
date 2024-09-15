import { type Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import AppDataSource from '../config/db';
import { User } from '../entity/User';
import PredictService from '../services/predict.service';
import { checkPassword, createPasswordHash } from '../utils/userUtils';
import { type Predict } from '../entity/Predict';
import { calculateStats, type IStatistics } from '../utils/statistics';

interface ChangePasswordFormValues {
  oldPassword: string;
  password: string;
}

class UserService {
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getUserProfile(userId: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          nickname: true,
          avatar: true,
          role: true,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async getUserPublicProfile(userId: number, tournamentId: number): Promise<{ user: User; statistics: IStatistics }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          nickname: true,
          avatar: true,
        },
      });
      const predictions = await this.getUserStatistics(userId, tournamentId);
      const statistics = calculateStats(predictions);
      if (!user) {
        throw new Error('User not found');
      }
      return { user, statistics };
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async getUserStatistics(userId: number, tournamentId: number): Promise<Predict[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          nickname: true,
          avatar: true,
        },
      });
      const predictions = await PredictService.getPredictByUserIdAndTournamentId(userId, tournamentId);
      if (!user) {
        throw new Error('User not found');
      }
      return predictions;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async editUserProfile(userId: number, data: User, filename: string): Promise<User> {
    try {
      let newData = { ...data };
      if (filename) {
        newData = { ...data, avatar: filename };
      }
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          nickname: true,
          avatar: true,
          role: true,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      if (user.role !== 'admin') {
        delete newData.role;
      }
      await this.userRepository.update(userId, newData);
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }

  async changePassword(userId: number, data: ChangePasswordFormValues): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new Error('User not found');
      }
      const validPassword = bcrypt.compareSync(data.oldPassword, user.password);
      if (!validPassword) {
        throw new Error('Invalid password');
      }
      const isValidPassword = checkPassword(data.password);
      if (!isValidPassword) {
        throw new Error(
          'Password must be at least 8 characters long containing at least one number and one capital letter',
        );
      }
      if (data.oldPassword === data.password) {
        throw new Error('New password must be different from the old password');
      }
      const hash = createPasswordHash(data.password);
      await this.userRepository.update({ id: userId }, { password: hash });
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new UserService();
