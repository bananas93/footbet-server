import { Predict } from '../entity/Predict';
import { AppDataSource } from '../config/db';
import { type Repository } from 'typeorm';

class PredictService {
  private readonly predictRepository: Repository<Predict>;

  constructor() {
    this.predictRepository = AppDataSource.getRepository(Predict);
  }

  async getAllPredicts(): Promise<Predict[]> {
}

export default new PredictService();
