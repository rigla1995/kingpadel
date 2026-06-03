import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function parseTimeToDate(base: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async findAll(venueId?: string) {
    return this.prisma.court.findMany({
      where: { isActive: true, ...(venueId ? { venueId } : {}) },
      include: { venue: { select: { name: true, city: true } }, availabilities: true },
    });
  }

  async findOne(id: string) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: { venue: true, availabilities: true },
    });
    if (!court) throw new NotFoundException('Terrain introuvable');
    return court;
  }

  async getAvailability(courtId: string, date: string) {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: { availabilities: true },
    });
    if (!court) throw new NotFoundException('Terrain introuvable');

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    const availability = court.availabilities.find((a) => a.dayOfWeek === dayOfWeek);
    if (!availability) {
      return { slots: [], message: 'Fermé ce jour' };
    }

    const existingReservations = await this.prisma.reservation.findMany({
      where: {
        courtId,
        startTime: { gte: startOfDay(targetDate) },
        endTime: { lte: endOfDay(targetDate) },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    const slots: { startTime: string; endTime: string; available: boolean }[] = [];
    const slotDuration = court.slotDuration;
    const openTime = parseTimeToDate(targetDate, availability.openTime);
    const closeTime = parseTimeToDate(targetDate, availability.closeTime);

    let current = new Date(openTime);
    while (addMinutes(current, slotDuration) <= closeTime) {
      const slotEnd = addMinutes(current, slotDuration);
      const isBooked = existingReservations.some((r) => {
        return (
          (current >= r.startTime && current < r.endTime) ||
          (slotEnd > r.startTime && slotEnd <= r.endTime)
        );
      });
      slots.push({
        startTime: current.toISOString(),
        endTime: slotEnd.toISOString(),
        available: !isBooked,
      });
      current = slotEnd;
    }

    return { slots };
  }

  async create(managerId: string, data: any) {
    const venue = await this.prisma.venue.findUnique({ where: { id: data.venueId } });
    if (!venue) throw new NotFoundException('Club introuvable');
    if (venue.managerId !== managerId) throw new ForbiddenException('Accès refusé');
    return this.prisma.court.create({ data });
  }

  async update(id: string, managerId: string, data: any) {
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: { venue: true },
    });
    if (!court) throw new NotFoundException('Terrain introuvable');
    if (court.venue.managerId !== managerId) throw new ForbiddenException('Accès refusé');
    return this.prisma.court.update({ where: { id }, data });
  }
}
