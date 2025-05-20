import { Module } from '@nestjs/common';
import { ENCRYPTOR_PROVIDER } from './crypto.provider';
import { ScryptEncryptor } from './scrypt.encrptor';

@Module({
  providers: [
    {
      provide: ENCRYPTOR_PROVIDER,
      useClass: ScryptEncryptor,
    },
  ],
  exports: [ENCRYPTOR_PROVIDER],
})
export class EncryptorModule {}
