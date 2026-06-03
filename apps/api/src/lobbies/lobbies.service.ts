import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class LobbiesService {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService,
  ) {}

  async create(creatorId: string, reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.userId !== creatorId) throw new ForbiddenException('Accès refusé');

    const existing = await this.prisma.lobby.findUnique({ where: { reservationId } });
    if (existing) throw new ConflictException('Un lobby existe déjà pour cette réservation');

    const lobby = await this.prisma.lobby.create({
      data: {
        reservationId,
        creatorId,
        players: { create: { userId: creatorId } },
      },
      include: {
        players: { include: { user: { select: { id: true, firstName: true, lastName: true, level: true, eloScore: true } } } },
        reservation: { include: { court: { include: { venue: { select: { name: true } } } } } },
      },
    });
    return lobby;
  }

  async findOne(id: string) {
    const lobby = await this.prisma.lobby.findUnique({
      where: { id },
      include: {
        players: { include: { user: { select: { id: true, firstName: true, lastName: true, level: true, eloScore: true, avatar: true } } } },
        scores: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        reservation: { include: { court: { include: { venue: { select: { name: true, address: true } } } } } },
      },
    });
    if (!lobby) throw new NotFoundException('Lobby introuvable');
    return lobby;
  }

  async join(lobbyId: string, userId: string) {
    const lobby = await this.prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: { players: true },
    });
    if (!lobby) throw new NotFoundException('Lobby introuvable');
    if (lobby.status === 'FULL' || lobby.players.length >= 4) {
      throw new BadRequestException('Lobby complet');
    }
    try {
      await this.prisma.lobbyPlayer.create({ data: { lobbyId, userId } });
    } catch {
      throw new ConflictException('Vous êtes déjà dans ce lobby');
    }

    const updatedCount = await this.prisma.lobbyPlayer.count({ where: { lobbyId } });
    if (updatedCount >= 4) {
      await this.prisma.lobby.update({ where: { id: lobbyId }, data: { status: 'FULL' } });
    }
    return { message: 'Rejoint le lobby' };
  }

  async submitScore(lobbyId: string, userId: string, scores: { userId: string; score: string; result: string }[]) {
    const lobby = await this.prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: { players: { include: { user: true } }, scores: true },
    });
    if (!lobby) throw new NotFoundException('Lobby introuvable');

    const isParticipant = lobby.players.some((p) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Vous nêtes pas dans ce lobby');

    if (lobby.scores.length > 0) throw new ConflictException('Score déjà soumis');

    const winners = scores.filter((s) => s.result === 'WIN');
    const losers = scores.filter((s) => s.result === 'LOSS');

    const scoreOperations = scores.map((s) => {
      let eloChange = 0;
      const playerElo = lobby.players.find((p) => p.userId === s.userId)?.user.eloScore ?? 1000;

      if (s.result === 'WIN' && losers.length > 0) {
        const loserElo = lobby.players.find((p) => p.userId === losers[0].userId)?.user.eloScore ?? 1000;
        const { winnerChange } = this.scoring.calculateEloChange(playerElo, loserElo);
        eloChange = winnerChange;
      } else if (s.result === 'LOSS' && winners.length > 0) {
        const winnerElo = lobby.players.find((p) => p.userId === winners[0].userId)?.user.eloScore ?? 1000;
        const { loserChange } = this.scoring.calculateEloChange(winnerElo, playerElo);
        eloChange = loserChange;
      }

      return { ...s, lobbyId, eloChange };
    });

    await Promise.all(
      scoreOperations.map(async (s) => {
        await this.prisma.matchScore.create({
          data: {
            lobbyId: s.lobbyId,
            userId: s.userId,
            score: s.score,
            result: s.result as any,
            eloChange: s.eloChange,
          },
        });
        await this.prisma.user.update({
          where: { id: s.userId },
          data: { eloScore: { increment: s.eloChange } },
        });
      }),
    );

    await this.prisma.lobby.update({ where: { id: lobbyId }, data: { status: 'COMPLETED' } });
    return { message: 'Score enregistré, ELO mis à jour' };
  }

  async findOpen(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [lobbies, total] = await Promise.all([
      this.prisma.lobby.findMany({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          players: { include: { user: { select: { id: true, firstName: true, lastName: true, level: true } } } },
          reservation: { include: { court: { include: { venue: { select: { name: true, city: true } } } } } },
        },
      }),
      this.prisma.lobby.count({ where: { status: 'OPEN' } }),
    ]);
    return { lobbies, total, page, limit };
  }
}
