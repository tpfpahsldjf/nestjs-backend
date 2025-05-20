import { Body, Controller, Post } from '@nestjs/common';
import {
  SignInWithEmailDto,
  SignInWithEmailResponseDto,
  SignUpWithEmailDto,
  SignUpWithEmailResponseDto,
} from './dto/account.dto';
import { AccountService } from './account.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
@Controller()
export class AccountController {
  constructor(private readonly authService: AccountService) {}

  @Post('/signup')
  @ApiOperation({ summary: '이메일 회원가입' })
  @ApiCreatedResponse({
    description: '회원가입 성공 시 JWT 액세스 토큰 반환',
    type: SignUpWithEmailResponseDto,
  })
  async signup(@Body() body: SignUpWithEmailDto) {
    return this.authService.signUpWithEmail(body.email, body.password);
  }

  @Post('/signin')
  @ApiOperation({ summary: '이메일 로그인' })
  @ApiOkResponse({
    description: '로그인 성공 시 JWT 액세스 토큰 반환',
    type: SignInWithEmailResponseDto,
  })
  async signin(@Body() body: SignInWithEmailDto) {
    return this.authService.signInWithEmail(body.email, body.password);
  }
}
