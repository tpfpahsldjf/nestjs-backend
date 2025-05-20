import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards, Get, Query,
} from '@nestjs/common';
import { EventType } from '../common/enums/event-type.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../modules/auth-core/guard/jwt.auth.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { UserRole } from '../common/enums/user.role.enum';
import {
  ApiBearerAuth,
  ApiCreatedResponse, ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation, ApiQuery,
} from '@nestjs/swagger';
import { AdminEventService } from './admin-event.service';
import { AddRewardDto } from './dto/add-reward.dto';
import { RemoveRewardDto } from './dto/remove-reward.dto';
import { CreateEventDto } from './dto/create.event.dto';
import { EventListDto } from '../event/dto/event.list.dto';
import { TransformResponse } from '../common/interceptor/transform-response.interceptor';
import { RewardHistoryResponseDto } from '../event/dto/reward-history-response.dto';

@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminEventController {
  constructor(private readonly adminEventService: AdminEventService) {}

  @Get()
  @ApiOperation({
    summary: '전체 이벤트 조회',
    description: '전체 이벤트 리스트를 반환합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호 (기본값: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수 (기본값: 20)',
    example: 20,
  })
  @ApiOkResponse({ type: EventListDto, isArray: true })
  @TransformResponse(EventListDto)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiForbiddenResponse({
    description: 'ADMIN 또는 OPERATOR 권한이 없는 경우',
  })
  async getEvents(@Query('page') _page = 1, @Query('limit') _limit = 20) {
    //TODO::페이징처리 구현 예정
    return this.adminEventService.getEvents();
  }

  @Post()
  @ApiOperation({ summary: '이벤트 생성' })
  @ApiCreatedResponse({
    description: '이벤트 생성 성공 시 메시지 반환',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Event created successfully' },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiForbiddenResponse({
    description: 'ADMIN 또는 OPERATOR 권한이 없는 경우',
  })
  async createEvent(@Body() dto: CreateEventDto) {
    await this.adminEventService.createEvent(dto);
    return { message: 'Event created successfully' };
  }

  @Patch(':type/:tag/rewards')
  @ApiOperation({
    summary: '이벤트 보상 추가',
    description:
      '이벤트에 보상을 추가합니다. 이미 존재하는 보상은 수량이 합산됩니다.',
  })
  @ApiOkResponse({
    description: '보상 추가 완료',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Reward added successfully' },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiForbiddenResponse({
    description: 'ADMIN 또는 OPERATOR 권한이 없는 경우',
  })
  async addReward(
    @Param('type') eventType: EventType,
    @Param('tag') eventTag: string,
    @Body() body: AddRewardDto,
  ) {
    await this.adminEventService.addReward(eventType, eventTag, body.rewards);
    return { message: 'Reward added successfully' };
  }

  @Delete(':type/:tag/rewards')
  @ApiOperation({
    summary: '이벤트 보상 제거',
    description: '이벤트에 등록된 보상 중 특정 보상을 제거합니다.',
  })
  @ApiOkResponse({
    description: '보상 제거 완료',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Reward removed successfully' },
      },
    },
  })
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiForbiddenResponse({
    description: 'ADMIN 또는 OPERATOR 권한이 없는 경우',
  })
  async removeReward(
    @Param('type') eventType: EventType,
    @Param('tag') eventTag: string,
    @Body() body: RemoveRewardDto,
  ) {
    await this.adminEventService.removeReward(
      eventType,
      eventTag,
      body.rewards,
    );
    return { message: 'Reward removed successfully' };
  }

  @Get('history')
  @ApiOperation({
    summary: '유저 보상 수령 내역 조회',
    description: 'userId를 기준으로 해당 유저의 보상 수령 내역을 조회합니다.',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: '조회할 유저의 ID (없으면 전체 조회)',
    example: '663c6fdc91e8c830a0d1b0f5',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호 (기본값: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수 (기본값: 20)',
    example: 20,
  })
  @ApiOkResponse({ type: RewardHistoryResponseDto, isArray: true })
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.AUDITOR)
  @ApiForbiddenResponse({
    description: 'ADMIN 또는 OPERATOR 또는 AUDITOR 권한이 없는 경우',
  })
  @TransformResponse(RewardHistoryResponseDto)
  async getRewardHistory(
    @Query('userId') userId: string,
    @Query('page') _page = 1,
    @Query('limit') _limit = 20,
  ) {
    //TODO::페이징처리 구현 예정
    return this.adminEventService.getRewardHistories(userId);
  }
}
