import { type Request, type Response } from 'express';
import TeamService from '../services/team.service';

class TeamController {
  async getAllTeams(req: Request, res: Response): Promise<Response> {
    try {
      const { type } = req.query;
      const teams = await TeamService.getAllTeams(type as string);
      return res.status(200).json(teams);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async getTeamById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const team = await TeamService.getTeamById(Number(id));
      return res.status(200).json(team);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async createTeam(req: Request, res: Response): Promise<Response> {
    try {
      const team = await TeamService.createTeam(req.body);
      return res.status(201).json({ team, message: 'Team successfully created' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async updateTeam(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const team = await TeamService.updateTeam(Number(id), req.body);
      return res.status(200).json({ team, message: 'Team successfully updated' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async deleteTeam(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await TeamService.deleteTeam(Number(id));
      return res.status(200).json({ message: 'Team successfully deleted' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }
}

export default new TeamController();
