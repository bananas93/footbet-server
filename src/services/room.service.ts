import { type Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { Room, RoomType } from '../entity/Room';
import { User } from '../entity/User';
import { generateRoomPasswordToken, verifyPasswordToken } from '../utils/roomUtils';

export interface RoomPayload {
  name: string;
  type: RoomType;
  password?: string;
}

class TeamService {
  private readonly roomRepository: Repository<Room>;
  private readonly userRepository: Repository<User>;

  constructor() {
    this.roomRepository = AppDataSource.getRepository(Room);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getAllRooms(): Promise<Room[]> {
    try {
      const rooms = await this.roomRepository.find({
        relations: {
          participants: true,
          creator: true,
        },
        select: {
          id: true,
          name: true,
          type: true,
          inviteUrl: true,
          creator: {
            id: true,
            name: true,
          },
          participants: {
            id: true,
            name: true,
          },
        },
      });
      if (!rooms) {
        return [];
      }
      return rooms;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id },
        relations: {
          participants: true,
          creator: true,
        },
        select: {
          id: true,
          name: true,
          type: true,
          inviteUrl: true,
          creator: {
            id: true,
            name: true,
          },
          participants: {
            id: true,
            name: true,
          },
        },
      });
      if (!room) {
        throw new Error('Room not found');
      }
      return room;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async createRoom(data: RoomPayload, userId: number): Promise<Room> {
    try {
      const { name, type, password } = data;
      const creator = await this.userRepository.findOne({ where: { id: userId } });
      const insertedRoom = await this.roomRepository.insert({
        name,
        type,
        password: type === RoomType.PUBLIC ? null : password,
        creator,
        participants: [creator],
      });

      // Fetch the room again to ensure it has the generated ID
      const room = await this.roomRepository.findOne({ where: { id: insertedRoom.generatedMaps[0].id } });

      if (!room) {
        throw new Error('Error fetching the created room.');
      }

      if (type === RoomType.PRIVATE) {
        if (!password || typeof password !== 'string') {
          throw new Error('Password is required for private rooms.');
        }
        room.password = password;
      }

      room.participants = [creator];

      const passwordToken = await generateRoomPasswordToken(password);
      const inviteUrl = `/join-room?roomId=${room.id}&passwordToken=${passwordToken}`;

      room.inviteUrl = inviteUrl;

      await this.roomRepository.save(room);
      return room;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while creating the room.');
    }
  }

  async updateRoom(id: number, data: RoomPayload, userId: number): Promise<Room> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id },
        relations: { creator: true },
        select: {
          creator: {
            id: true,
          },
        },
      });
      if (!room) {
        throw new Error('Room not found');
      }

      console.log('room.creator.id', room);
      if (room.creator.id !== userId) {
        throw new Error('You are not authorized to update this room.');
      }

      const updatedRoomData: Partial<Room> = {
        ...data,
        password: data.type === RoomType.PUBLIC ? null : data.password,
      };

      if (data.type === RoomType.PRIVATE) {
        if (!data.password || typeof data.password !== 'string') {
          throw new Error('Password is required for private rooms.');
        }
        updatedRoomData.password = data.password;
      }

      const updatedRoom = await this.roomRepository.save({ ...room, ...updatedRoomData });
      return updatedRoom;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while updating the room.');
    }
  }

  async joinRoomByInviteUrl(inviteUrl: string, userId: number): Promise<Room> {
    try {
      const passwordToken = inviteUrl.split('passwordToken=')[1];
      const roomId = inviteUrl.split('roomId=')[1].split('&')[0];
      const password = verifyPasswordToken(passwordToken);
      if (!password) {
        throw new Error('Invalid password token');
      }
      const room = await this.roomRepository.findOne({
        where: { id: Number(roomId) },
        relations: { participants: true },
      });

      if (room.type === RoomType.PRIVATE && room.password !== password) {
        throw new Error('Invalid password');
      }

      if (!room) {
        throw new Error('Room not found');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error('User not found');
      }

      if (room.participants.some((participant) => participant.id === user.id)) {
        throw new Error('User is already a participant of this room');
      }

      room.participants.push(user);
      await this.roomRepository.save(room);
      return room;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while joining the room.');
    }
  }

  async joinRoom(roomId: number, userId: number, password?: string): Promise<Room> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: roomId },
        relations: { participants: true },
      });

      if (!room) {
        throw new Error('Room not found');
      }

      if (room.type === RoomType.PRIVATE && room.password !== password) {
        throw new Error('Invalid password');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error('User not found');
      }

      if (room.participants.some((participant) => participant.id === user.id)) {
        throw new Error('User is already a participant of this room');
      }

      room.participants.push(user);
      await this.roomRepository.save(room);
      return room;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while joining the room.');
    }
  }

  async leaveRoom(roomId: number, userId: number): Promise<Room> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id: roomId },
        relations: { participants: true },
      });

      if (!room) {
        throw new Error('Room not found');
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error('User not found');
      }

      if (!room.participants.some((participant) => participant.id === user.id)) {
        throw new Error('User is not a participant of this room');
      }

      if (room.creator.id === user.id) {
        throw new Error('Creator cannot leave the room');
      }

      room.participants = room.participants.filter((participant) => participant.id !== user.id);
      await this.roomRepository.save(room);
      return room;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while leaving the room.');
    }
  }

  async deleteRoom(id: number, userId: number): Promise<boolean> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id },
        relations: { creator: true },
        select: {
          creator: {
            id: true,
          },
        },
      });

      if (!room) {
        throw new Error('Room not found');
      }

      room.participants = [];
      await this.roomRepository.save(room);

      if (room.creator.id !== userId) {
        throw new Error('You are not authorized to delete this room.');
      }
      await this.roomRepository.delete({ id });
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'An error occurred while deleting the room.');
    }
  }
}

export default new TeamService();
