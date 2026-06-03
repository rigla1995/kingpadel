import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reservations')
export class ReservationsController {
  constructor(private reservations: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une réservation' })
  create(@Request() req, @Body() body: any) {
    return this.reservations.create(req.user.id, body);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mes réservations' })
  getMyReservations(@Request() req) {
    return this.reservations.getMyReservations(req.user.id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmer une réservation' })
  confirm(@Param('id') id: string, @Request() req) {
    return this.reservations.confirm(id, req.user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Annuler une réservation' })
  cancel(@Param('id') id: string, @Request() req) {
    return this.reservations.cancel(id, req.user.id);
  }
}
