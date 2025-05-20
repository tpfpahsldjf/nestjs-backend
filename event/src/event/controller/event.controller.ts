import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { EventService } from '../service/event.service';
import { TransformResponse } from '../../common/interceptor/transform-response.interceptor';
import { EventListDto } from '../dto/event.list.dto';
import { ReportEventRequestDto } from '../dto/report-event-request.dto';
import { JwtAuthGuard } from '../../modules/auth-core/guard/jwt.auth.guard';
import { CurrentUser } from '../../modules/auth-core/decorators/current-user.decorator';
import { JwtPayload } from '../../modules/auth-core/types/jwt-payload.interface';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { UserRole } from '../../common/enums/user.role.enum';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.USER)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('report')
  @ApiOperation({
    summary: '이벤트 리포트',
    description: `유저가 특정 이벤트를 발생시킵니다. (예: 로그인 3일 연속)
    
    현재 기능은 "연속 로그인"만 개발되어 있습니다. 
    하루에 한 번만 로그인 처리되므로 이벤트 달성을 빠르게 테스트하려면 score 값을 조정하여 제출하세요.
    `,
  })
  @ApiOkResponse({
    description: '이벤트가 정상 처리되었을 때 반환됩니다.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'event processed',
        },
      },
    },
  })
  async reportEvent(
    @Body() body: ReportEventRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.eventService.execute(
      user.sub,
      body.type,
      body.tag,
      body.score ?? 1,
      body.meta ?? {},
    );

    return { message: 'event processed' };
  }

  @Get('/list')
  @ApiOperation({
    summary: '활성 이벤트 조회',
    description: '현재 유저에게 적용 가능한 활성 이벤트 리스트를 반환합니다.',
  })
  @ApiOkResponse({ type: EventListDto, isArray: true })
  @TransformResponse(EventListDto)
  async getActiveEvents() {
    return this.eventService.getActiveEvents();
  }
}
