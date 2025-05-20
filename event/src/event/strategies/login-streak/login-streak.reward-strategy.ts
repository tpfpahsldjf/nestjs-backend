import { Injectable } from '@nestjs/common';
import { EventType } from '../../../common/enums/event-type.enum';
import { RewardStrategy } from '../../interfaces/reward-strategy.interface';
import { RegisterRewardStrategy } from 'src/event/decorators/register.reward-strategy.decorator';
import { Reward } from '../../repository/schema/reward.schema';

@RegisterRewardStrategy(EventType.LOGIN_STREAK)
@Injectable()
export class LoginStreakRewardStrategy implements RewardStrategy {
  giveReward(userId: string, reward: Reward[]): Promise<boolean> {

    /*
    해당 부분은 스펙 내역에 포함되어있지않음

    아이템 지급 요청 부분을 구현하는 곳
    유저 인벤토리 DB 접근 금지
    API호출을 통해서 요청을 하는것으로 개발 예정
     */

    return Promise.resolve(true);
  }
}
