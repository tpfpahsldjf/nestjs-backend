import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventSchema,
  EventSchemaClass,
} from './repository/schema/event.schema';
import { MongooseEventRepository } from './repository/mongoose.event.repository';
import { EVENT_REPOSITORY } from './repository/event.repository.interface';
import { EventController } from './controller/event.controller';
import { EventService } from './service/event.service';
import { EventConditionFactory } from './factory/event-condition.factory';
import { LoginStreakConditionStrategy } from './strategies/login-streak/login-streak.condition-strategy';
import { EventTriggerFactory } from './factory/event-trigger.factory';
import { LoginStreakRewardStrategy } from './strategies/login-streak/login-streak.reward-strategy';
import { EventRewardFactory } from './factory/event-reward-strategy.factory';
import { DiscoveryModule } from '@nestjs/core';
import { LoginStreakTriggerStrategy } from './strategies/login-streak/login-streak.trigger-strategy';
import {
  LoginStreakSchema,
  LoginStreakSchemaClass,
} from './repository/schema/login-streak.schema';
import { RewardClaimController } from './controller/reward.claim.controller';
import { REWARD_CLAIM_REPOSITORY } from './repository/reward-claim.repository.interface';
import { MongooseRewardClaimRepository } from './repository/mongoose.reward-claim.repository';
import { RewardClaimService } from './service/Reward-claim.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheUtil } from '../common/utils/cache.util';
import {
  RewardHistorySchema,
  RewardHistorySchemaClass,
} from './repository/schema/reward-history.schema';



@Module({
  imports: [
    CacheModule.register(),
    DiscoveryModule,
    MongooseModule.forFeature([
      { name: EventSchemaClass.name, schema: EventSchema },
      { name: RewardHistorySchemaClass.name, schema: RewardHistorySchema },
      { name: LoginStreakSchemaClass.name, schema: LoginStreakSchema },
    ]),
  ],
  providers: [
    CacheUtil,
    EventService,
    RewardClaimService,
    EventConditionFactory,
    EventRewardFactory,
    EventTriggerFactory,
    LoginStreakConditionStrategy,
    LoginStreakRewardStrategy,
    LoginStreakTriggerStrategy,
    {
      provide: EVENT_REPOSITORY,
      useClass: MongooseEventRepository,
    },
    {
      provide: REWARD_CLAIM_REPOSITORY,
      useClass: MongooseRewardClaimRepository,
    },
  ],
  controllers: [EventController, RewardClaimController],
})
export class EventModule {}