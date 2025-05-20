import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventType } from '../../common/enums/event-type.enum';
import { ApiProperty } from '@nestjs/swagger';
export class ReportEventRequestDto {
  @ApiProperty({
    enum: EventType,
    example: EventType.LOGIN_STREAK,
    description: '이벤트 타입 (enum)',
  })
  @IsEnum(EventType)
  type: EventType;


  @ApiProperty({
    example: 'login-3days',
    description: '이벤트 고유 태그',
  })
  @IsString()
  tag: string;

  @ApiProperty({
    required: false,
    example: 1,
    description: '점수 또는 횟수 값 (선택)',
  })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({
    required: false,
    example: { loginTime: '2024-05-20T00:00:00Z' },
    description: '추가 메타데이터 (선택)',
  })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}
