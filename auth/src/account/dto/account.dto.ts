import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpWithEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsNotEmpty()
  password: string;
}

export class SignInWithEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsNotEmpty()
  password: string;
}

export class SignInWithEmailResponseDto {
  @ApiProperty({
    description: 'Access Token (JWT)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5...',
  })
  accessToken: string;
}

export class SignUpWithEmailResponseDto {
  @ApiProperty({
    description: 'Access Token (JWT)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5...',
  })
  accessToken: string;
}