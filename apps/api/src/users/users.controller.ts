import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('ranking')
  @ApiOperation({ summary: 'Classement des joueurs par ELO' })
  getRanking(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.users.getRanking(Number(page), Number(limit));
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Profil de lutilisateur connecté' })
  getMe(@Request() req) {
    return this.users.getMe(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour mon profil' })
  updateMe(@Request() req, @Body() body: any) {
    return this.users.updateMe(req.user.id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Profil public dun joueur' })
  getProfile(@Param('id') id: string) {
    return this.users.getPublicProfile(id);
  }
}
