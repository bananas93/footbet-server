import { MatchStatus, type Match, MatchResult } from '../entity/Match';
import { type Predict } from '../entity/Predict';

interface CalculateResult {
  totalPoints: number;
  exactScorePoints: number;
  matchResultPoints: number;
  goalsDifferencePoints: number;
  fivePlusGoalsPoints: number;
}

class PointsCalculator {
  private constructor() {
    // Private constructor to prevent instantiation
  }

  static getInstance(): PointsCalculator {
    return new PointsCalculator();
  }

  calculatePointsForPrediction(match: Match, prediction: Predict): 0 | CalculateResult {
    if (![MatchStatus.IN_PROGRESS, MatchStatus.FINISHED].includes(match.status)) {
      return 0;
    }

    const exactScorePoints = this.calculateExactScorePoints(match, prediction);
    const matchResultPoints = this.calculateMatchResultPoints(match, prediction);
    const goalsDifferencePoints = this.calculateGoalsDifferencePoints(match, prediction);
    const fivePlusGoalsPoints = this.calculateFivePlusGoalsPoints(match, prediction);

    // Sum up the points
    const totalPoints = exactScorePoints + matchResultPoints + goalsDifferencePoints + fivePlusGoalsPoints;

    return { totalPoints, exactScorePoints, matchResultPoints, goalsDifferencePoints, fivePlusGoalsPoints };
  }

  private calculateExactScorePoints(match: Match, prediction: Predict): number {
    return match.homeScore === prediction.homeScore && match.awayScore === prediction.awayScore ? 5 : 0;
  }

  private calculateMatchResultPoints(match: Match, prediction: Predict): number {
    const matchResult = this.determineMatchResult(match);
    const predictionResult = this.determineMatchResult(prediction);

    return matchResult === predictionResult ? 2 : 0;
  }

  private calculateGoalsDifferencePoints(match: Match, prediction: Predict): number {
    const goalsDifferenceMatch = Math.abs(match.homeScore - match.awayScore);
    const goalsDifferencePrediction = Math.abs(prediction.homeScore - prediction.awayScore);

    return goalsDifferenceMatch === goalsDifferencePrediction ? 1 : 0;
  }

  private calculateFivePlusGoalsPoints(match: Match, prediction: Predict): number {
    const totalGoalsMatch = match.homeScore + match.awayScore;
    const totalGoalsPrediction = prediction.homeScore + prediction.awayScore;

    return totalGoalsMatch >= 5 && totalGoalsPrediction >= 5 ? 1 : 0;
  }

  private determineMatchResult(entity: { homeScore?: number; awayScore?: number }): MatchResult {
    const homeScore = entity.homeScore || 0;
    const awayScore = entity.awayScore || 0;

    if (homeScore > awayScore) {
      return MatchResult.HOME_WIN;
    } else if (homeScore < awayScore) {
      return MatchResult.AWAY_WIN;
    } else {
      return MatchResult.DRAW;
    }
  }
}

export default PointsCalculator.getInstance();
