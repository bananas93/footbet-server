import { type Repository } from 'typeorm';
import AppDataSource from '../config/db';
import { User } from '../entity/User';

class LanguageService {
  private readonly userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async setLanguage(lang: string, userId: number): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      await this.userRepository.update({ id: userId }, { language: lang });
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred in the service layer');
    }
  }
}

export default new LanguageService();
