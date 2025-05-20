import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../../common/enums/user.role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    description: '권한을 변경할 대상 유저의 고유 ID',
    example: '663b25bcf9847a72b1fc9481',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '변경할 사용자 역할',
    enum: UserRole,
    example: UserRole.OPERATOR,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
