import { IsEnum, IsString } from 'class-validator';
import { EventType } from '../../common/enums/event-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimRewardRequestDto {
  @ApiProperty({ enum: EventType, example: EventType.LOGIN_STREAK })
  @IsEnum(EventType)
  type: EventType;


  @ApiProperty({ example: 'login-3days' })
  @IsString()
  tag: string;
}
