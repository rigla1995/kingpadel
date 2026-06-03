import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlayerLevel } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'joueur@kingpadel.tn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Mohamed' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ben Ali' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: PlayerLevel, default: PlayerLevel.BEGINNER })
  @IsEnum(PlayerLevel)
  @IsOptional()
  level?: PlayerLevel;
}
