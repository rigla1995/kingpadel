import { PrismaClient, UserRole, PlayerLevel, EventType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KingPadel database...');

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kingpadel.tn' },
    update: {},
    create: {
      email: 'admin@kingpadel.tn',
      passwordHash: await bcrypt.hash('Admin1234!', 12),
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      level: PlayerLevel.PRO,
      eloScore: 2000,
      isVerified: true,
    },
  });
  console.log('Created admin:', admin.email);

  // Venue Manager
  const manager = await prisma.user.upsert({
    where: { email: 'enseigne@kingpadel.tn' },
    update: {},
    create: {
      email: 'enseigne@kingpadel.tn',
      passwordHash: await bcrypt.hash('Test1234!', 12),
      firstName: 'Karim',
      lastName: 'Mansour',
      role: UserRole.VENUE_MANAGER,
      level: PlayerLevel.ADVANCED,
      eloScore: 1400,
      isVerified: true,
    },
  });
  console.log('Created manager:', manager.email);

  // Players
  const player1 = await prisma.user.upsert({
    where: { email: 'joueur@kingpadel.tn' },
    update: {},
    create: {
      email: 'joueur@kingpadel.tn',
      passwordHash: await bcrypt.hash('Test1234!', 12),
      firstName: 'Mohamed',
      lastName: 'Ben Ali',
      role: UserRole.PLAYER,
      level: PlayerLevel.INTERMEDIATE,
      eloScore: 1150,
      isVerified: true,
    },
  });

  const player2 = await prisma.user.upsert({
    where: { email: 'joueur2@kingpadel.tn' },
    update: {},
    create: {
      email: 'joueur2@kingpadel.tn',
      passwordHash: await bcrypt.hash('Test1234!', 12),
      firstName: 'Sami',
      lastName: 'Trabelsi',
      role: UserRole.PLAYER,
      level: PlayerLevel.BEGINNER,
      eloScore: 950,
      isVerified: true,
    },
  });
  console.log('Created players:', player1.email, player2.email);

  // Venue
  const venue = await prisma.venue.upsert({
    where: { id: 'venue-tunis-1' },
    update: {},
    create: {
      id: 'venue-tunis-1',
      name: 'Club Padel Tunis',
      description: 'Le meilleur club de padel à Tunis, avec 3 terrains couverts et en plein air.',
      address: '12 Avenue Habib Bourguiba',
      city: 'Tunis',
      phone: '+216 71 000 111',
      email: 'contact@clubpadeltunis.tn',
      isSponsored: true,
      sponsorRank: 1,
      isActive: true,
      managerId: manager.id,
    },
  });
  console.log('Created venue:', venue.name);

  // Courts
  const court1 = await prisma.court.upsert({
    where: { id: 'court-1' },
    update: {},
    create: {
      id: 'court-1',
      name: 'Terrain 1 — Centre',
      surface: 'artificial_grass',
      isIndoor: true,
      pricePerSlot: 80,
      slotDuration: 90,
      isActive: true,
      venueId: venue.id,
    },
  });

  const court2 = await prisma.court.upsert({
    where: { id: 'court-2' },
    update: {},
    create: {
      id: 'court-2',
      name: 'Terrain 2 — Extérieur A',
      surface: 'artificial_grass',
      isIndoor: false,
      pricePerSlot: 60,
      slotDuration: 90,
      isActive: true,
      venueId: venue.id,
    },
  });

  const court3 = await prisma.court.upsert({
    where: { id: 'court-3' },
    update: {},
    create: {
      id: 'court-3',
      name: 'Terrain 3 — Extérieur B',
      surface: 'artificial_grass',
      isIndoor: false,
      pricePerSlot: 60,
      slotDuration: 90,
      isActive: true,
      venueId: venue.id,
    },
  });
  console.log('Created courts:', court1.name, court2.name, court3.name);

  // Court availabilities (Mon=1 to Sun=0, every day 8:00–22:00)
  for (const court of [court1, court2, court3]) {
    for (let day = 0; day <= 6; day++) {
      await prisma.courtAvailability.upsert({
        where: { id: `avail-${court.id}-${day}` },
        update: {},
        create: {
          id: `avail-${court.id}-${day}`,
          courtId: court.id,
          dayOfWeek: day,
          openTime: '08:00',
          closeTime: '22:00',
        },
      });
    }
  }
  console.log('Created court availabilities');

  // Events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(15, 0, 0, 0);

  const event1 = await prisma.event.upsert({
    where: { id: 'event-1' },
    update: {},
    create: {
      id: 'event-1',
      title: 'Tournoi Open Padel Tunis',
      description: 'Grand tournoi ouvert à tous les niveaux. Venez participer et découvrir de nouveaux partenaires!',
      type: EventType.PUBLIC,
      requiredLevel: null,
      maxPlayers: 16,
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
      price: 25,
      venueId: venue.id,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: 'event-2' },
    update: {},
    create: {
      id: 'event-2',
      title: 'Match Intermédiaires — Accès Restreint',
      description: 'Match privé réservé aux joueurs de niveau intermédiaire et plus.',
      type: EventType.PRIVATE,
      requiredLevel: PlayerLevel.INTERMEDIATE,
      maxPlayers: 8,
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000),
      price: 0,
      venueId: venue.id,
    },
  });
  console.log('Created events:', event1.title, event2.title);

  // Subscribe player1 to the venue
  await prisma.venueSubscription.upsert({
    where: { venueId_userId: { venueId: venue.id, userId: player1.id } },
    update: {},
    create: { venueId: venue.id, userId: player1.id },
  });

  // Notification for player1
  await prisma.notification.create({
    data: {
      userId: player1.id,
      title: 'Bienvenue sur KingPadel!',
      body: 'Votre compte est activé. Réservez votre premier terrain maintenant.',
    },
  });

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin:   admin@kingpadel.tn / Admin1234!');
  console.log('  Manager: enseigne@kingpadel.tn / Test1234!');
  console.log('  Player1: joueur@kingpadel.tn / Test1234!');
  console.log('  Player2: joueur2@kingpadel.tn / Test1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
