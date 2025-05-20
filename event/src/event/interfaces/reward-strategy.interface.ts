import { Reward } from '../repository/schema/reward.schema';

export interface RewardStrategy {
  giveReward(userId: string, reward: Reward[]): Promise<boolean>;
}
