import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth-core/guard/jwt.auth.guard';
import { CurrentUser } from '../../modules/auth-core/decorators/current-user.decorator';
import { JwtPayload } from '../../modules/auth-core/types/jwt-payload.interface';
import { TransformResponse } from '../../common/interceptor/transform-response.interceptor';
import { RewardClaimService } from '../service/Reward-claim.service';
import { ClaimRewardRequestDto } from '../dto/claim-reward-request.dto';
import { RewardHistoryResponseDto } from '../dto/reward-history-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { UserRole } from '../../common/enums/user.role.enum';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('/reward')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardClaimController {
  constructor(private readonly rewardClaimService: RewardClaimService) {}

  @Post('claim')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: '보상 클레임 요청',
    description:
      '특정 이벤트에 대해 보상을 요청합니다. 조건을 만족하지 않거나 이미 수령했다면 실패합니다.',
  })
  @ApiForbiddenResponse({
    description: 'ADMIN 또는 USER 권한이 없는 경우',
  })
  @ApiOkResponse({
    description: '보상 요청 처리 결과 메시지',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'reward claim request processed' },
      },
    },
  })
  async claimReward(
    @Body() body: ClaimRewardRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.rewardClaimService.claimReward(user.sub, body.type, body.tag);
    return { message: 'reward claim request processed' };
  }

  @Get('history/me')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({
    summary: '내 보상 수령 내역 조회',
    description: '본인의 보상 요청 내역을 조회합니다.',
  })
  @ApiForbiddenResponse({
    description: 'ADMIN 또는 USER 권한이 없는 경우',
  })
  @ApiOkResponse({ type: RewardHistoryResponseDto, isArray: true })
  @TransformResponse(RewardHistoryResponseDto)
  async getMyRewardHistory(@CurrentUser() user: JwtPayload) {
    return this.rewardClaimService.getRewardHistories(user.sub);
  }
}