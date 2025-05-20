import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  ACCOUNT_REPOSITORY,
  AccountRepository,
} from './repository/account.repository.interface';
import { ErrorMessages } from '../common/constants/error-messages';
import {
  SignInWithEmailResponseDto,
  SignUpWithEmailResponseDto,
} from './dto/account.dto';
import { TOKEN_PROVIDER, TokenProvider } from '../auth/token/token.provider';
import { AccountData } from './repository/schema/account.schema';
import {
  EncryptorProvider,
  ENCRYPTOR_PROVIDER,
} from '../crypto/crypto.provider';
import { ErrorCode } from '../common/enums/error-code.enum';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly repository: AccountRepository<AccountData>,
    @Inject(TOKEN_PROVIDER) private readonly tokenService: TokenProvider,
    @Inject(ENCRYPTOR_PROVIDER) private readonly encryptor: EncryptorProvider,
  ) {}

  public async signUpWithEmail(
    email: string,
    password: string,
  ): Promise<SignUpWithEmailResponseDto> {
    //TODO::몽고디비 엔터프라이즈모델의 FLE를 사용한다면 해당 암호화 가능 삭제 가능
    const hashedPassword = await this.encryptor.hash(password);

    const result = await this.repository.createEmailAccount(
      email,
      hashedPassword,
    );

    if (!result.isOk) {
      throw new BadRequestException(
        ErrorMessages[result.error],
        result.error.toString(),
      );
    }

    return {
      accessToken: this.tokenService.sign({
        sub: result.value.id,
        role: result.value.role,
      }),
    };
  }

  public async signInWithEmail(
    email: string,
    password: string,
  ): Promise<SignInWithEmailResponseDto> {
    const result = await this.repository.findByEmail(email);

    //TODO::계정명이 틀린것과 비밀번호가 틀린것에 대한 에러가 구분되는게 오히려 보안상 안좋을 가능성이 있음
    if (!result.isOk) {
      throw new BadRequestException(
        ErrorMessages[result.error],
        result.error.toString(),
      );
    }

    //TODO::몽고디비 엔터프라이즈모델의 FLE를 사용한다면 해당 암호화 가능 삭제 가능
    const isMatch = await this.encryptor.compare(
      password,
      result.value.password,
    );

    if (!isMatch) {
      throw new BadRequestException(
        ErrorMessages[ErrorCode.INVALID_ARGUMENT],
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    this.repository.updateLastLoginAt(email).catch((err) => {
      this.logger.warn(`Failed to update lastLoginAt for ${email}: ${err.message}`);
    });

    return {
      accessToken: this.tokenService.sign({
        sub: result.value.id,
        role: result.value.role,
      }),
    };
  }
}
