import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VenuesModule } from './venues/venues.module';
import { CourtsModule } from './courts/courts.module';
import { ReservationsModule } from './reservations/reservations.module';
import { EventsModule } from './events/events.module';
import { LobbiesModule } from './lobbies/lobbies.module';
import { ScoringModule } from './scoring/scoring.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    VenuesModule,
    CourtsModule,
    ReservationsModule,
    EventsModule,
    LobbiesModule,
    ScoringModule,
    NotificationsModule,
  ],
})
export class AppModule {}
