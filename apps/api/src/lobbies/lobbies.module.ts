import { Module } from '@nestjs/common';
import { LobbiesController } from './lobbies.controller';
import { LobbiesService } from './lobbies.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [PrismaModule, ScoringModule],
  controllers: [LobbiesController],
  providers: [LobbiesService],
  exports: [LobbiesService],
})
export class LobbiesModule {}
