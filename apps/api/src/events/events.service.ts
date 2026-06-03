import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { venueId?: string; type?: string; level?: string; page?: number; limit?: number }) {
    const { venueId, type, level, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (venueId) where.venueId = venueId;
    if (type) where.type = type;
    if (level) where.requiredLevel = level;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
        include: {
          venue: { select: { name: true, city: true } },
          _count: { select: { participants: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);
    return { events, total, page, limit };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        venue: { select: { name: true, address: true, city: true } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true, level: true } },
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Événement introuvable');
    return event;
  }

  async create(managerId: string, data: any) {
    const venue = await this.prisma.venue.findUnique({ where: { id: data.venueId } });
    if (!venue) throw new NotFoundException('Club introuvable');
    if (venue.managerId !== managerId) throw new ForbiddenException('Accès refusé');
    return this.prisma.event.create({ data, include: { venue: { select: { name: true } } } });
  }

  async join(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { participants: true } } },
    });
    if (!event) throw new NotFoundException('Événement introuvable');
    if (event._count.participants >= event.maxPlayers) {
      throw new BadRequestException('Événement complet');
    }
    try {
      await this.prisma.eventParticipant.create({ data: { eventId, userId } });
    } catch {
      throw new ConflictException('Vous participez déjà à cet événement');
    }
    return { message: 'Inscription confirmée' };
  }

  async leave(eventId: string, userId: string) {
    await this.prisma.eventParticipant.deleteMany({ where: { eventId, userId } });
    return { message: 'Désinscription effectuée' };
  }
}
