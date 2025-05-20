import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RewardDto {
  @ApiProperty()
  @Expose()
  readonly type: string;

  @ApiProperty()
  @Expose()
  readonly itemId: string;

  @ApiProperty()
  @Expose()
  readonly amount: number;
}