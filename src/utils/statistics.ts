import { type Predict } from '../entity/Predict';

export interface IStatistics {
  total: number;
  totalPoints: number;
  correctScore: number;
  correctDifference: number;
  fivePlusGoals: number;
  correctResult: number;
  correctScorePercentage: number;
  correctResultPercentage: number;
  correctScorePerRow: number;
  correctResultPerRow: number;
  longestLosingStreak: number; // Longest streak without correct predictions
  mostCommonCorrectScore: string; // Most frequently predicted correct score
  correctHomePredictions: number; // Correct predictions for home teams
  correctAwayPredictions: number; // Correct predictions for away teams
  mostCommonPrediction: 'home' | 'away' | 'draw'; // Most common user prediction
  topFiveFavoriteTeams: Array<{ team: string; points: number }>; // Top 5 teams by earned points
  mostPopularPredictedScore: string; // Most frequently predicted score
}

const generateAllPossibleScores = (maxGoals: number = 8): Record<string, number> => {
  const scoreMap: Record<string, number> = {};

  for (let homeScore = 0; homeScore <= maxGoals; homeScore++) {
    for (let awayScore = 0; awayScore <= maxGoals; awayScore++) {
      const key = `${homeScore}-${awayScore}`;
      scoreMap[key] = 0;
    }
  }

  return scoreMap;
};

const possibleScores = generateAllPossibleScores();

export const calculateStats = (predict: Predict[]): IStatistics => {
  const statistics: IStatistics = {
    total: predict.length,
    totalPoints: 0,
    correctScore: 0,
    correctDifference: 0,
    fivePlusGoals: 0,
    correctResult: 0,
    correctScorePercentage: 0,
    correctResultPercentage: 0,
    correctScorePerRow: 0,
    correctResultPerRow: 0,
    longestLosingStreak: 0,
    mostCommonCorrectScore: '',
    correctHomePredictions: 0,
    correctAwayPredictions: 0,
    mostCommonPrediction: 'home',
    topFiveFavoriteTeams: [], // Initialize the top 5 teams array
    mostPopularPredictedScore: '', // Initialize the most popular predicted score
  };

  let currentCorrectScoreStreak = 0;
  let maxCorrectScoreStreak = 0;
  let currentCorrectResultStreak = 0;
  let maxCorrectResultStreak = 0;

  let currentLosingStreak = 0;
  let maxLosingStreak = 0;

  const teamPoints: Record<string, number> = {};
  const teamCorrectPredictions: Record<string, number> = {};
  const scoreCounts = possibleScores;
  const predictedScoreCounts: Record<string, number> = {}; // To track predicted scores

  let homePredictions = 0;
  let awayPredictions = 0;
  let drawPredictions = 0;

  predict.forEach((prediction) => {
    const { match, homeScore, awayScore, correctScore, correctResult, correctDifference, points } = prediction;

    statistics.totalPoints += points;

    // Track points by team for favorite team calculation
    const homeTeam = match.homeTeam.name; // Assuming match contains team details
    const awayTeam = match.awayTeam.name; // Assuming match contains team details

    teamPoints[homeTeam] = (teamPoints[homeTeam] || 0) + points;
    teamPoints[awayTeam] = (teamPoints[awayTeam] || 0) + points;

    // Track predicted score
    const predictedScoreKey = `${homeScore}-${awayScore}`;
    predictedScoreCounts[predictedScoreKey] = (predictedScoreCounts[predictedScoreKey] || 0) + 1;

    // Losing Streak
    if (correctScore || correctResult || correctDifference) {
      currentLosingStreak = 0; // Reset losing streak
    } else {
      currentLosingStreak += 1;
      maxLosingStreak = Math.max(maxLosingStreak, currentLosingStreak);
    }

    // Correct score streak
    if (correctScore) {
      statistics.correctScore += 1;
      currentCorrectScoreStreak += 1;
      maxCorrectScoreStreak = Math.max(maxCorrectScoreStreak, currentCorrectScoreStreak);

      // Track correct score predictions per team
      teamCorrectPredictions[homeTeam] = (teamCorrectPredictions[homeTeam] || 0) + 1;
      teamCorrectPredictions[awayTeam] = (teamCorrectPredictions[awayTeam] || 0) + 1;

      // Track the most common correct score
      const scoreKey = `${homeScore}-${awayScore}`;
      scoreCounts[scoreKey] = (scoreCounts[scoreKey] || 0) + 1;
    } else {
      currentCorrectScoreStreak = 0; // reset the streak if incorrect
    }

    // Correct result streak
    if (correctResult) {
      statistics.correctResult += 1;
      currentCorrectResultStreak += 1;
      maxCorrectResultStreak = Math.max(maxCorrectResultStreak, currentCorrectResultStreak);
    } else {
      currentCorrectResultStreak = 0;
    }

    if (correctDifference) {
      statistics.correctDifference += 1;
    }

    // Home vs Away Predictions
    if (prediction.homeScore > prediction.awayScore) {
      // User predicted the home team to win
      if (correctResult) statistics.correctHomePredictions += 1;
      homePredictions += 1;
    } else if (prediction.awayScore > prediction.homeScore) {
      // User predicted the away team to win
      if (correctResult) statistics.correctAwayPredictions += 1;
      awayPredictions += 1;
    }

    // Track the most common prediction type
    if (prediction.homeScore > prediction.awayScore) {
      homePredictions += 1;
    } else if (prediction.homeScore < prediction.awayScore) {
      awayPredictions += 1;
    } else {
      drawPredictions += 1;
    }
  });

  // Most common correct score
  statistics.mostCommonCorrectScore = Object.keys(scoreCounts).reduce((a, b) =>
    scoreCounts[a] > scoreCounts[b] ? a : b,
  );

  // Most popular predicted score
  statistics.mostPopularPredictedScore = Object.keys(predictedScoreCounts).reduce((a, b) =>
    predictedScoreCounts[a] > predictedScoreCounts[b] ? a : b,
  );

  // Calculate correct score and result percentages
  statistics.correctScorePercentage = (statistics.correctScore / statistics.total) * 100;
  statistics.correctResultPercentage = (statistics.correctResult / statistics.total) * 100;

  // Set the maximum streak values
  statistics.correctScorePerRow = maxCorrectScoreStreak;
  statistics.correctResultPerRow = maxCorrectResultStreak;

  // Set the longest losing streak
  statistics.longestLosingStreak = maxLosingStreak;

  // Determine the most common prediction type
  statistics.mostCommonPrediction =
    homePredictions > awayPredictions && homePredictions > drawPredictions
      ? 'home'
      : awayPredictions > drawPredictions
      ? 'away'
      : 'draw';

  // Determine top 5 favorite teams
  const topTeams = Object.entries(teamPoints)
    .sort(([, a], [, b]) => b - a) // Sort by points in descending order
    .slice(0, 5) // Get top 5
    .map(([team, points]) => ({ team, points }));

  statistics.topFiveFavoriteTeams = topTeams;

  return statistics;
};
