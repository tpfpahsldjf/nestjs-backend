import { RewardDto } from '../../event/dto/reward.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddRewardDto {
  @ApiProperty({
    type: [RewardDto],
    description: '추가할 보상 목록',
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
