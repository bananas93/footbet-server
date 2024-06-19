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
  }>
>;

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

      if (!this.table[homeTeam]) this.addToTable(match.groupName, homeTeam, match.homeTeam.logo);
      if (!this.table[awayTeam]) this.addToTable(match.groupName, awayTeam, match.awayTeam.logo);

      this.increasePlayed(match.groupName, [homeTeam, awayTeam], match.status);
      this.setResults(match.groupName, match);
      this.setGoals(match.groupName, homeTeam, match.homeScore, match.awayScore, match.status);
      this.setGoals(match.groupName, awayTeam, match.awayScore, match.homeScore, match.status);
      this.sortTable();
    });

    return this.table;
  }

  addToTable(group: string, team: string, logo: string): void {
    if (!this.table[group]) this.table[group] = [];
    if (!this.table[group].some((item) => item.team === team)) {
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
      });
    }
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
    Object.entries(this.table).map((group) =>
      group[1].sort(
        (a, b) =>
          b.points - a.points ||
          b.goalsScored - b.goalsAgainst - (a.goalsScored - a.goalsAgainst) ||
          b.goalsScored - a.goalsScored,
      ),
    );
  }
}

export default League;
