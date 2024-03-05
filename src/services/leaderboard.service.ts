import { type Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { Predict } from '../entity/Predict';
import { User } from '../entity/User';
import PointsCalculator from '../utils/calculate';
import predictService from './predict.service';

class LeaderboardService {
  private readonly userRepository: Repository<User>;
  private readonly predictRepository: Repository<Predict>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.predictRepository = AppDataSource.getRepository(Predict);
  }

  async getLeaderboard(): Promise<any[]> {
    const users = await this.userRepository.find();

    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        const predictions = await predictService.getPredictByUserId(user.id);

        const totalPoints = predictions.reduce((total: number, prediction: Predict) => {
          const { totalPoints } = PointsCalculator.calculatePointsForPrediction(prediction.match, prediction);
          return total + totalPoints;
        }, 0);

        return {
          userId: user.id,
          username: user.name,
          totalPoints,
          predictions: predictions.map((prediction: Predict) =>
            PointsCalculator.calculatePointsForPrediction(prediction.match, prediction),
          ),
        };
      }),
    );

    return leaderboardData;
  }
}

export default new LeaderboardService();
