import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [venues, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { isActive: true },
        orderBy: [{ isSponsored: 'desc' }, { sponsorRank: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          _count: { select: { courts: true, subscriptions: true } },
        },
      }),
      this.prisma.venue.count({ where: { isActive: true } }),
    ]);
    return { venues, total, page, limit };
  }

  async findOne(id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: {
        courts: { where: { isActive: true } },
        _count: { select: { subscriptions: true } },
      },
    });
    if (!venue) throw new NotFoundException('Club introuvable');
    return venue;
  }

  async create(managerId: string, data: any) {
    return this.prisma.venue.create({
      data: { ...data, managerId },
    });
  }

  async update(id: string, managerId: string, data: any) {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue) throw new NotFoundException('Club introuvable');
    if (venue.managerId !== managerId) throw new ForbiddenException('Accès refusé');
    return this.prisma.venue.update({ where: { id }, data });
  }

  async subscribe(venueId: string, userId: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Club introuvable');
    await this.prisma.venueSubscription.upsert({
      where: { venueId_userId: { venueId, userId } },
      create: { venueId, userId },
      update: {},
    });
    return { message: 'Abonnement activé' };
  }

  async unsubscribe(venueId: string, userId: string) {
    await this.prisma.venueSubscription.deleteMany({
      where: { venueId, userId },
    });
    return { message: 'Abonnement annulé' };
  }

  async getSubscribers(venueId: string) {
    return this.prisma.venueSubscription.findMany({
      where: { venueId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true, level: true },
        },
      },
    });
  }
}
