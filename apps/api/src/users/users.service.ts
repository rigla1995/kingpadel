import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        level: true,
        eloScore: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            reservations: true,
            lobbyParticipants: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateMe(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatar?: string; level?: any }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        level: true,
        eloScore: true,
      },
    });
  }

  async getPublicProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        level: true,
        eloScore: true,
        createdAt: true,
        _count: {
          select: {
            lobbyParticipants: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async getRanking(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [players, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'PLAYER' },
        orderBy: { eloScore: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          level: true,
          eloScore: true,
        },
      }),
      this.prisma.user.count({ where: { role: 'PLAYER' } }),
    ]);
    return { players, total, page, limit };
  }
}
