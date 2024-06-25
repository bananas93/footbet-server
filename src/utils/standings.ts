import { type Match } from '../entity/Match';

type ITable = Record<
  string,
  Array<{
    id: string;
    team: string;
    logo: string;
    played: number;
    won: number;
    lost: number;
    drawn: number;
    goalsScored: number;
    goalsAgainst: number;
    points: number;
    form: string[];
    rank: number;
  }>
>;

interface TeamStats {
  id: string;
  team: string;
  logo: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  goalsScored: number;
  goalsAgainst: number;
  points: number;
  form: string[];
  rank: number;
}

class League {
  matches: Match[];
  table: ITable;

  constructor(matches: Match[]) {
    this.matches = matches;
    this.table = {};
  }

  getStandings(): ITable {
    this.matches.forEach((match) => {
      const homeTeam = match.homeTeam.name;
      const awayTeam = match.awayTeam.name;

      if (!match.groupName) return;

      if (!this.table[match.groupName]) this.table[match.groupName] = [];

      if (!this.table[match.groupName].some((item) => item.team === homeTeam)) {
        this.addToTable(match.groupName, homeTeam, match.homeTeam.logo, match.homeTeam.rank);
      }

      if (!this.table[match.groupName].some((item) => item.team === awayTeam)) {
        this.addToTable(match.groupName, awayTeam, match.awayTeam.logo, match.awayTeam.rank);
      }

      this.increasePlayed(match.groupName, [homeTeam, awayTeam], match.status);
      this.setResults(match.groupName, match);
      this.setGoals(match.groupName, homeTeam, match.homeScore, match.awayScore, match.status);
      this.setGoals(match.groupName, awayTeam, match.awayScore, match.homeScore, match.status);
      this.sortTable();
    });

    return this.table;
  }

  addToTable(group: string, team: string, logo: string, rank: number): void {
    this.table[group].push({
      id: Math.random().toString(36).substr(2, 9),
      team,
      logo,
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0,
      goalsScored: 0,
      goalsAgainst: 0,
      points: 0,
      form: [],
      rank,
    });
  }

  increasePlayed(group: string | number, teams: any[], status: string): void {
    teams.forEach((team: string) => {
      this.table[group].forEach((item) => {
        if (status !== 'Scheduled') {
          return item.team === team ? (item.played += 1) : null;
        }
      });
    });
  }

  setResults(group: string | number, match: Match): void {
    const { homeScore, awayScore, status } = match;
    const homeTeam = match.homeTeam.name;
    const awayTeam = match.awayTeam.name;

    let homeResult = '';
    let awayResult = '';

    if (status !== 'Scheduled') {
      if (homeScore > awayScore) {
        homeResult = 'won';
        awayResult = 'lost';
        this.updateTeamStats(group, homeTeam, 'won', 3);
        this.updateTeamStats(group, awayTeam, 'lost', 0);
      } else if (homeScore < awayScore) {
        homeResult = 'lost';
        awayResult = 'won';
        this.updateTeamStats(group, homeTeam, 'lost', 0);
        this.updateTeamStats(group, awayTeam, 'won', 3);
      } else {
        homeResult = 'drawn';
        awayResult = 'drawn';
        this.updateTeamStats(group, homeTeam, 'drawn', 1);
        this.updateTeamStats(group, awayTeam, 'drawn', 1);
      }

      this.setTeamForm(group, homeTeam, homeResult);
      this.setTeamForm(group, awayTeam, awayResult);
    } else {
      this.setTeamForm(group, homeTeam, '');
      this.setTeamForm(group, awayTeam, '');
    }
  }

  updateTeamStats(group: string | number, team: string, resultType: string, points: number): void {
    this.table[group].forEach((item) => {
      if (item.team === team) {
        item[resultType]++;
        item.points += points;
      }
    });
  }

  setTeamForm(group: string | number, team: string, result: string): void {
    this.table[group].forEach((item) => {
      if (item.team === team) {
        item.form.push(result);
        if (item.form.length > 5) item.form.shift();
      }
    });
  }

  setGoals(group: string | number, team: string, scored: number, against: number, status: string): void {
    this.table[group].forEach((item) => {
      if (status !== 'Scheduled') {
        if (item.team === team) {
          item.goalsScored += scored;
          item.goalsAgainst += against;
        }
      }
    });
  }

  sortTable(): void {
    Object.entries(this.table).forEach(([group, teams]) =>
      teams.sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;

        // Head-to-head comparison
        const headToHeadMatches = this.matches.filter(
          (match) =>
            (match.homeTeam.name === a.team && match.awayTeam.name === b.team) ||
            (match.homeTeam.name === b.team && match.awayTeam.name === a.team),
        );

        if (headToHeadMatches.length > 0) {
          let aPoints = 0;
          let bPoints = 0;
          let aGoalDiff = 0;
          let bGoalDiff = 0;
          let aGoals = 0;
          let bGoals = 0;

          headToHeadMatches.forEach((match) => {
            if (match.homeTeam.name === a.team) {
              aGoals += match.homeScore;
              bGoals += match.awayScore;
              aGoalDiff += match.homeScore - match.awayScore;
              bGoalDiff += match.awayScore - match.homeScore;
              if (match.homeScore > match.awayScore) aPoints += 3;
              else if (match.homeScore < match.awayScore) bPoints += 3;
              else {
                aPoints += 1;
                bPoints += 1;
              }
            } else {
              bGoals += match.homeScore;
              aGoals += match.awayScore;
              bGoalDiff += match.homeScore - match.awayScore;
              aGoalDiff += match.awayScore - match.homeScore;
              if (match.homeScore > match.awayScore) bPoints += 3;
              else if (match.homeScore < match.awayScore) aPoints += 3;
              else {
                bPoints += 1;
                aPoints += 1;
              }
            }
          });

          if (aPoints !== bPoints) return bPoints - aPoints;
          if (aGoalDiff !== bGoalDiff) return bGoalDiff - aGoalDiff;
          if (aGoals !== bGoals) return bGoals - aGoals;
          return a.rank - b.rank;
        }

        // Overall goal difference and goals scored
        const goalDifferenceA = a.goalsScored - a.goalsAgainst;
        const goalDifferenceB = b.goalsScored - b.goalsAgainst;
        if (goalDifferenceA !== goalDifferenceB) return goalDifferenceB - goalDifferenceA;
        return b.goalsScored - a.goalsScored;
      }),
    );
  }

  getThirdPlaceTeams(): TeamStats[] {
    const thirdPlaceTeams: TeamStats[] = [];

    Object.entries(this.table).forEach(([group, teams]) => {
      if (teams.length >= 3) {
        thirdPlaceTeams.push(teams[2]); // Teams are already sorted, so the third team is at index 2
      }
    });

    thirdPlaceTeams.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;

      // Head-to-head comparison
      const headToHeadMatches = this.matches.filter(
        (match) =>
          (match.homeTeam.name === a.team && match.awayTeam.name === b.team) ||
          (match.homeTeam.name === b.team && match.awayTeam.name === a.team),
      );

      if (headToHeadMatches.length > 0) {
        let aPoints = 0;
        let bPoints = 0;
        let aGoalDiff = 0;
        let bGoalDiff = 0;
        let aGoals = 0;
        let bGoals = 0;

        headToHeadMatches.forEach((match) => {
          if (match.homeTeam.name === a.team) {
            aGoals += match.homeScore;
            bGoals += match.awayScore;
            aGoalDiff += match.homeScore - match.awayScore;
            bGoalDiff += match.awayScore - match.homeScore;
            if (match.homeScore > match.awayScore) aPoints += 3;
            else if (match.homeScore < match.awayScore) bPoints += 3;
            else {
              aPoints += 1;
              bPoints += 1;
            }
          } else {
            bGoals += match.homeScore;
            aGoals += match.awayScore;
            bGoalDiff += match.homeScore - match.awayScore;
            aGoalDiff += match.awayScore - match.homeScore;
            if (match.homeScore > match.awayScore) bPoints += 3;
            else if (match.homeScore < match.awayScore) aPoints += 3;
            else {
              bPoints += 1;
              aPoints += 1;
            }
          }
        });

        if (aPoints !== bPoints) return bPoints - aPoints;
        if (aGoalDiff !== bGoalDiff) return bGoalDiff - aGoalDiff;
        if (aGoals !== bGoals) return bGoals - aGoals;
      }

      // Overall goal difference and goals scored
      const goalDifferenceA = a.goalsScored - a.goalsAgainst;
      const goalDifferenceB = b.goalsScored - b.goalsAgainst;
      if (goalDifferenceA !== goalDifferenceB) return goalDifferenceB - goalDifferenceA;
      if (a.goalsScored !== b.goalsScored) return b.goalsScored - a.goalsScored;
      return a.rank - b.rank;
    });

    return thirdPlaceTeams;
  }
}

export default League;
