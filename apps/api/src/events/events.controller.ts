import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des événements' })
  findAll(
    @Query('venueId') venueId?: string,
    @Query('type') type?: string,
    @Query('level') level?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.events.findAll({ venueId, type, level, page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail dun événement' })
  findOne(@Param('id') id: string) {
    return this.events.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un événement' })
  create(@Request() req, @Body() body: any) {
    return this.events.create(req.user.id, body);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rejoindre un événement' })
  join(@Param('id') id: string, @Request() req) {
    return this.events.join(id, req.user.id);
  }

  @Delete(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quitter un événement' })
  leave(@Param('id') id: string, @Request() req) {
    return this.events.leave(id, req.user.id);
  }
}
