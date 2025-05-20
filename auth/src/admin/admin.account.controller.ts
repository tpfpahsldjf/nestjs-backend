// admin.controller.ts
import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { AdminAccountService } from './admin.account.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../modules/auth-core/guard/jwt.auth.guard';
import { CurrentUser } from '../modules/auth-core/decorators/current-user.decorator';
import { JwtPayload } from '../modules/auth-core/types/jwt-payload.interface';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorator/roles.decorator';
import { UserRole } from '../common/enums/user.role.enum';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('admin/account')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminAccountController {
  constructor(private readonly adminService: AdminAccountService) {}

  @Roles(UserRole.ADMIN)
  @Patch('role')
  @ApiOperation({
    summary: '유저 권한 변경',
    description: '관리자가 유저의 역할(Role)을 변경합니다.',
  })
  @ApiOkResponse({ description: '권한 변경 성공 메시지 반환' })
  async updateRole(
    @Body() dto: UpdateRoleDto,
    @CurrentUser() adminUser: JwtPayload,
  ) {
    await this.adminService.updateRole(adminUser.sub, dto.userId, dto.role);
    return { message: 'Role updated successfully' };
  }
  @Patch('test-role')
  @ApiOperation({
    summary: '[TEST] 유저 권한 테스트 변경 [권한체크없이 변경가능]',
  })
  @ApiOkResponse({ description: '테스트용 권한 변경 성공' })
  async testUpdateRole(
    @Body() dto: UpdateRoleDto,
    @CurrentUser() adminUser: JwtPayload,
  ) {
    await this.adminService.updateRole(adminUser.sub, dto.userId, dto.role);
    return { message: 'Role updated successfully' };
  }
}