import { Router } from 'express';
import RoomController from '../controllers/room.controller';
import checkAuth from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', checkAuth, async (req, res) => await RoomController.getAllRooms(req, res)); // Get all rooms
router.get('/:id', checkAuth, async (req, res) => await RoomController.getRoomById(req, res)); // Get room by id
router.post('/', checkAuth, async (req, res) => await RoomController.createRoom(req, res)); // Create a new room
router.put('/:id', checkAuth, async (req, res) => await RoomController.updateRoom(req, res)); // Update room
router.post('/join', checkAuth, async (req, res) => await RoomController.joinRoomByInviteUrl(req, res)); // Join room by invite url
router.post('/join/:id', checkAuth, async (req, res) => await RoomController.joinRoom(req, res)); // Join room
router.get('/leave/:id', checkAuth, async (req, res) => await RoomController.leaveRoom(req, res)); // Leave room
router.delete('/:id', checkAuth, async (req, res) => await RoomController.deleteRoom(req, res)); // Delete room

export default router;
