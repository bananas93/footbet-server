import { type Request, type Response } from 'express';
import RoomService from '../services/room.service';
import { getUserIdFromToken } from '../utils/userUtils';

class PredictController {
  async getAllRooms(req: Request, res: Response): Promise<Response> {
    try {
      const rooms = await RoomService.getAllRooms();
      return res.status(200).json(rooms);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async getRoomById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const room = await RoomService.getRoomById(Number(id));
      return res.status(200).json(room);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async createRoom(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const room = await RoomService.createRoom(req.body, Number(userId));
      return res.status(201).json({ room, message: 'Room successfully created' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async updateRoom(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const { id } = req.params;
      const room = await RoomService.updateRoom(Number(id), req.body, Number(userId));
      return res.status(200).json({ room, message: 'Room successfully updated' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async joinRoomByInviteUrl(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const { inviteUrl } = req.body;
      const room = await RoomService.joinRoomByInviteUrl(inviteUrl, Number(userId));
      return res.status(200).json({ room, message: 'Room successfully joined' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async joinRoom(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const { id } = req.params;
      const { password } = req.body;
      const room = await RoomService.joinRoom(Number(id), Number(userId), password);
      return res.status(200).json({ room, message: 'Room successfully joined' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async leaveRoom(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const { id } = req.params;
      await RoomService.leaveRoom(Number(id), Number(userId));
      return res.status(200).json({ message: 'Room successfully left' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }

  async deleteRoom(req: Request, res: Response): Promise<Response> {
    try {
      const userId = getUserIdFromToken(req.headers);
      const { id } = req.params;
      await RoomService.deleteRoom(Number(id), Number(userId));
      return res.status(200).json({ message: 'Room successfully deleted' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'An error occurred in the controller layer' });
    }
  }
}

export default new PredictController();
