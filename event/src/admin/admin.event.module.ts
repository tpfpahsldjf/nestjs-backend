import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventSchema,
  EventSchemaClass,
} from '../event/repository/schema/event.schema';
import { AdminEventController } from './admin-event.controller';
import { AdminEventService } from './admin-event.service';
import { MongooseAdminEventRepository } from './mongoose.admin.event.repository';
import { ADMIN_EVENT_REPOSITORY } from './admin-event.repository.interface';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheUtil } from '../common/utils/cache.util';
import { RewardHistorySchemaClass } from '../event/repository/schema/reward-history.schema';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([
      {
        name: EventSchemaClass.name,
        schema: EventSchema,
      },
      {
        name: RewardHistorySchemaClass.name,
        schema: RewardHistorySchemaClass,
      },
    ]),
  ],
  controllers: [AdminEventController],
  providers: [
    CacheUtil,
    AdminEventService,
    {
      provide: ADMIN_EVENT_REPOSITORY,
      useClass: MongooseAdminEventRepository,
    },
  ],
})
export class AdminEventModule {}
