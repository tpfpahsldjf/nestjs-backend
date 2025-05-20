import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RewardDto } from '../../event/dto/reward.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveRewardDto {
  @ApiProperty({
    type: [RewardDto],
    description: '삭제할 보상 목록',
    example: [
      {
        type: 'ITEM',
        itemId: 'potion_hp',
        amount: 5,
      },
      {
        type: 'ITEM',
        itemId: 'gem_50',
        amount: 50,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardDto)
  rewards: RewardDto[];
}