import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LobbiesService } from './lobbies.service';

@ApiTags('Lobbies')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('lobbies')
export class LobbiesController {
  constructor(private lobbies: LobbiesService) {}

  @Get('open')
  @ApiOperation({ summary: 'Liste des lobbies ouverts' })
  findOpen(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.lobbies.findOpen(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail dun lobby' })
  findOne(@Param('id') id: string) {
    return this.lobbies.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un lobby depuis une réservation' })
  create(@Request() req, @Body('reservationId') reservationId: string) {
    return this.lobbies.create(req.user.id, reservationId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Rejoindre un lobby' })
  join(@Param('id') id: string, @Request() req) {
    return this.lobbies.join(id, req.user.id);
  }

  @Post(':id/score')
  @ApiOperation({ summary: 'Soumettre le score dun match' })
  submitScore(@Param('id') id: string, @Request() req, @Body('scores') scores: any[]) {
    return this.lobbies.submitScore(id, req.user.id, scores);
  }
}
