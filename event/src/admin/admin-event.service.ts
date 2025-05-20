import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventData } from '../event/repository/schema/event.schema';
import { RewardDto } from '../event/dto/reward.dto';
import {
  ADMIN_EVENT_REPOSITORY,
  AdminEventRepository,
} from './admin-event.repository.interface';
import { EventType } from '../common/enums/event-type.enum';
import { ErrorMessages } from '../common/constants/error-messages';
import { ErrorCode } from '../common/enums/error-code.enum';
import { CreateEventDto } from './dto/create.event.dto';
import { ImmutableList } from '../common/types/immutable.type';
import { CacheUtil } from '../common/utils/cache.util';

@Injectable()
export class AdminEventService {
  constructor(
    @Inject(ADMIN_EVENT_REPOSITORY)
    private readonly adminEventRepository: AdminEventRepository,
    private readonly cacheUtil: CacheUtil,
  ) {}

  public async getEvents(): Promise<ImmutableList<EventData>> {
    return this.cacheUtil.getOrSet('events:all', 5, async () => {
      const result = await this.adminEventRepository.getEvents();

      if (!result.isOk) {
        throw new NotFoundException(
          ErrorMessages[ErrorCode.NOT_FOUND],
          ErrorCode.NOT_FOUND,
        );
      }

      return result.value;
    });
  }

  async createEvent(dto: CreateEventDto): Promise<void> {
    const event: EventData = {
      id: '',
      ...dto,
    };

    const result = await this.adminEventRepository.createEvent(event);

    if(!result.isOk) {
      throw new BadRequestException(
        ErrorMessages[result.error],
        result.error.toString(),
      );
    }
  }

  async addReward(
    eventType: EventType,
    eventTag: string,
    rewards: RewardDto[],
  ): Promise<void> {
    const result = await this.adminEventRepository.addRewards(
      eventType,
      eventTag,
      rewards,
    );

    if (!result.isOk) {
      throw new BadRequestException(
        ErrorMessages[result.error],
        result.error.toString(),
      );
    }
  }

  async removeReward(
    eventType: EventType,
    eventTag: string,
    rewards: RewardDto[],
  ): Promise<void> {
    const result = await this.adminEventRepository.RemoveRewards(
      eventType,
      eventTag,
      rewards,
    );

    if (result.isOk && !result.value) {
      throw new NotFoundException(
        ErrorMessages[ErrorCode.NOT_FOUND],
        ErrorCode.NOT_FOUND,
      );
    }

    if(!result.isOk) {
      throw new BadRequestException(
        ErrorMessages[result.error],
        result.error.toString(),
      );
    }
  }

  async getRewardHistories(userId: string) {
    const result = userId
      ? await this.adminEventRepository.findClaimsByUser(userId)
      : await this.adminEventRepository.findAllClaims();

    if (!result.isOk) {
      throw new NotFoundException(
        ErrorMessages[ErrorCode.NOT_FOUND],
        ErrorCode.NOT_FOUND,
      );
    }

    return result.value;
  }
}