import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountSchema,
  AccountSchemaClass,
} from './repository/schema/account.schema';
import { MongooseAccountRepository } from './repository/mongoose.account.repository';
import { ACCOUNT_REPOSITORY } from './repository/account.repository.interface';
import { AuthModule } from '../auth/auth.module';
import { EncryptorModule } from '../crypto/encryptor.module';


@Module({
  imports: [
    AuthModule,
    EncryptorModule,
    MongooseModule.forFeature([
      { name: AccountSchemaClass.name, schema: AccountSchema },
    ]),
  ],
  controllers: [AccountController],
  providers: [
    AccountService,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: MongooseAccountRepository,
    },
  ],
})
export class AccountModule {}
