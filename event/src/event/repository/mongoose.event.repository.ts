import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { EventRepository } from './event.repository.interface';
import { EventData, EventSchemaClass } from './schema/event.schema';
import { ResultType, Result } from '../../common/types/result.type';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { Immutable, ImmutableList } from '../../common/types/immutable.type';
import { EventType } from '../../common/enums/event-type.enum';

@Injectable()
export class MongooseEventRepository implements EventRepository<EventData> {
  readonly logger = new Logger(MongooseEventRepository.name);
  constructor(
    @InjectModel(EventSchemaClass.name)
    private readonly eventModel: Model<EventSchemaClass>,
  ) {}

  async findEventById(
    id: string,
  ): Promise<ResultType<Immutable<EventData>, ErrorCode>> {
    const event = await this.eventModel.findById(id).lean<EventData>().exec();

    if (!event) return Result.fail(ErrorCode.NOT_EXISTS);

    return Result.ok(event);
  }

  async getActiveEvents(): Promise<
    ResultType<ImmutableList<EventData>, ErrorCode>
  > {
    try {
      const now = new Date();
      const events = await this.eventModel
        .find({
          enabled: true,
          startAt: { $lte: now },
          endAt: { $gt: now },
        })
        .lean<EventData[]>()
        .exec();

      if (events.length < 1) return Result.fail(ErrorCode.NOT_EXISTS);

      return Result.ok(events as ImmutableList<EventData>);
    } catch (err: any) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async findActiveEventsByTypeAndTag(
    type: EventType,
    tag: string,
  ): Promise<ResultType<Immutable<EventData>, ErrorCode>> {
    try {
      const now = new Date();

      const event = await this.eventModel
        .findOne({
          type,
          tag,
          enabled: true,
          startAt: { $lte: now },
          endAt: { $gt: now },
        })
        .lean<EventData>()
        .exec();

      if (!event) return Result.fail(ErrorCode.NOT_EXISTS);

      return Result.ok(event);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async findEventByTypeAndTag(
    type: EventType,
    tag: string,
  ): Promise<ResultType<Immutable<EventData>, ErrorCode>> {
    try {
      const event = await this.eventModel
        .findOne({
          type,
          tag,
        })
        .lean<EventData>()
        .exec();

      if (!event) return Result.fail(ErrorCode.NOT_EXISTS);

      return Result.ok(event);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }
}
