import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Mes notifications' })
  getMyNotifications(@Request() req) {
    return this.notifications.getMyNotifications(req.user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marquer toutes comme lues' })
  markAllRead(@Request() req) {
    return this.notifications.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  markRead(@Param('id') id: string, @Request() req) {
    return this.notifications.markRead(id, req.user.id);
  }
}
