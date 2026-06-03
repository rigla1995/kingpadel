import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VenuesService } from './venues.service';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
  constructor(private venues: VenuesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des clubs' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.venues.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail dun club' })
  findOne(@Param('id') id: string) {
    return this.venues.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un club' })
  create(@Request() req, @Body() body: any) {
    return this.venues.create(req.user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un club' })
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.venues.update(id, req.user.id, body);
  }

  @Post(':id/subscribe')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sabonner à un club' })
  subscribe(@Param('id') id: string, @Request() req) {
    return this.venues.subscribe(id, req.user.id);
  }

  @Delete(':id/subscribe')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Se désabonner dun club' })
  unsubscribe(@Param('id') id: string, @Request() req) {
    return this.venues.unsubscribe(id, req.user.id);
  }

  @Get(':id/subscribers')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste des abonnés dun club' })
  getSubscribers(@Param('id') id: string) {
    return this.venues.getSubscribers(id);
  }
}
