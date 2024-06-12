import { Predict } from '../entity/Predict';
import AppDataSource from '../config/db';
import { In, type Repository } from 'typeorm';

export interface PredictPayload {
  userId: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
}

export interface IPredictTableResponse {
  id: number;
  name: string;
  points: number;
  correctScore: number;
  correctDifference: number;
  fivePlusGoals: number;
  correctResult: number;
}

class PredictService {
  private readonly predictRepository: Repository<Predict>;

  constructor() {
    this.predictRepository = AppDataSource.getRepository(Predict);
  }

  async getAllPredicts(): Promise<Predict[]> {
    try {
      const predicts = await this.predictRepository.find({
        relations: ['match', 'user', 'match.homeTeam', 'match.awayTeam'],
        select: {
          match: {
            id: true,
            status: true,
            homeTeam: {
              id: true,
              name: true,
            },
            awayTeam: {
              id: true,
              name: true,
            },
            homeScore: true,
            awayScore: true,
          },
          user: {
            id: true,
            name: true,
          },
        },
      });
      return predicts;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async getPredictsTableByTournament(tournamentId: number): Promise<IPredictTableResponse[]> {
    try {
      const predicts = await this.predictRepository
        .createQueryBuilder('predict')
        .select('user.id', 'id')
        .addSelect('user.name', 'name')
        .addSelect('SUM(predict.points)', 'points')
        .addSelect('SUM(CASE WHEN predict.correctScore <> 0 THEN 1 ELSE 0 END)', 'correctScore')
        .addSelect('SUM(CASE WHEN predict.correctDifference <> 0 THEN 1 ELSE 0 END)', 'correctDifference')
        .addSelect('SUM(CASE WHEN predict.fivePlusGoals <> 0 THEN 1 ELSE 0 END)', 'fivePlusGoals')
        .addSelect('SUM(CASE WHEN predict.correctResult <> 0 THEN 1 ELSE 0 END)', 'correctResult')
        .leftJoin('predict.user', 'user')
        .leftJoin('predict.match', 'match')
        .where('predict.tournamentId = :tournamentId', { tournamentId })
        .andWhere('match.status IN (:...status)', { status: ['Live', 'Finished'] })
        .groupBy('user.id')
        .addGroupBy('user.name')
        .getRawMany();

      return predicts;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async getPredictByMatchId(matchId: number): Promise<Predict[]> {
    try {
      const predicts = await this.predictRepository.find({
        where: { matchId },
        relations: {
          match: true,
          user: true,
        },
        select: {
          match: {
            id: true,
            stage: true,
            groupTour: true,
            status: true,
            groupName: true,
            homeScore: true,
            awayScore: true,
            matchDate: true,
          },
          user: {
            id: true,
            name: true,
          },
        },
      });
      return predicts;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async getPredictByUserId(userId: number): Promise<Predict[]> {
    try {
      const predicts = await this.predictRepository.find({
        where: { userId },
        relations: {
          match: true,
          user: true,
        },
        select: {
          match: {
            id: true,
            stage: true,
            groupTour: true,
            status: true,
            groupName: true,
            homeScore: true,
            awayScore: true,
            matchDate: true,
          },
          user: {
            id: true,
            name: true,
          },
        },
      });
      return predicts;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async createOrUpdatePredict(data: PredictPayload, userId: number): Promise<Predict> {
    try {
      const existedPredict = await this.predictRepository.findOne({
        where: {
          matchId: data.matchId,
          userId,
        },
      });

      if (existedPredict) {
        await this.predictRepository.update(existedPredict.id, { ...data, userId });
        const predict = await this.predictRepository.findOne({ where: { id: existedPredict.id } });
        return predict;
      }

      const predict = await this.predictRepository.save({ ...data, userId });
      return predict;
    } catch (error: any) {
      if (error.name === 'QueryFailedError' && error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid match');
      }
      throw new Error(error);
    }
  }

  async deletePredict(predictsIds: number[]): Promise<void> {
    try {
      const predicts = await this.predictRepository.find({
        where: { id: In(predictsIds) },
      });

      if (!predicts.length) {
        throw new Error('Predicts not found');
      }
      const deleteResult = await this.predictRepository.delete({ id: In(predictsIds) });
      if (!deleteResult.affected) {
        throw new Error('Predicts not found');
      }
    } catch (error: any) {
      throw new Error(error);
    }
  }
}

export default new PredictService();
