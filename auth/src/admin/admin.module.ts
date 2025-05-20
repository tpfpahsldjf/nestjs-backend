import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountSchema,
  AccountSchemaClass,
} from '../account/repository/schema/account.schema';
import { AdminAccountController } from './admin.account.controller';
import { AdminAccountService } from './admin.account.service';
import { MongooseAdminAccountRepository } from './mongoose.admin.account.repository';
import { ADMIN_ACCOUNT_REPOSITORY } from './admin.account.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountSchemaClass.name, schema: AccountSchema },
    ]),
  ],
  controllers: [AdminAccountController],
  providers: [
    AdminAccountService,
    {
      provide: ADMIN_ACCOUNT_REPOSITORY,
      useClass: MongooseAdminAccountRepository,
    },
  ],
})
export class AdminModule {}
