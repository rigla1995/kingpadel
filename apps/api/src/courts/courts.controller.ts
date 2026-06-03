import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CourtsService } from './courts.service';

@ApiTags('Courts')
@Controller('courts')
export class CourtsController {
  constructor(private courts: CourtsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des terrains' })
  findAll(@Query('venueId') venueId?: string) {
    return this.courts.findAll(venueId);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Disponibilités dun terrain pour une date' })
  getAvailability(@Param('id') id: string, @Query('date') date: string) {
    return this.courts.getAvailability(id, date);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un terrain' })
  create(@Request() req, @Body() body: any) {
    return this.courts.create(req.user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un terrain' })
  update(@Param('id') id: string, @Request() req, @Body() body: any) {
    return this.courts.update(id, req.user.id, body);
  }
}
