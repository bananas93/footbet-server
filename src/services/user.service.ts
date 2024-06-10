import { type Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { User } from '../entity/User';

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
}

export default new UserService();
