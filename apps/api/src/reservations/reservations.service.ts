import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { courtId: string; startTime: string; endTime: string }) {
    const court = await this.prisma.court.findUnique({ where: { id: data.courtId } });
    if (!court) throw new NotFoundException('Terrain introuvable');

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    const conflict = await this.prisma.reservation.findFirst({
      where: {
        courtId: data.courtId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });
    if (conflict) throw new ConflictException('Ce créneau est déjà réservé');

    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalPrice = Number(court.pricePerSlot) * (durationHours / (court.slotDuration / 60));

    return this.prisma.reservation.create({
      data: {
        userId,
        courtId: data.courtId,
        startTime,
        endTime,
        totalPrice,
        status: 'PENDING',
      },
      include: {
        court: { include: { venue: { select: { name: true, address: true } } } },
      },
    });
  }

  async getMyReservations(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
      include: {
        court: { include: { venue: { select: { name: true, address: true, city: true } } } },
        lobby: true,
      },
    });
  }

  async confirm(id: string, managerId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { court: { include: { venue: true } } },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.court.venue.managerId !== managerId) throw new ForbiddenException('Accès refusé');
    return this.prisma.reservation.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });
  }

  async cancel(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { court: { include: { venue: true } } },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.userId !== userId && reservation.court.venue.managerId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }
    return this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
