import { scrypt as _scrypt, randomBytes } from 'crypto';
import { EncryptorProvider } from './crypto.provider';
import { promisify } from 'util';
import { Injectable } from '@nestjs/common';
const scrypt = promisify(_scrypt);

@Injectable()
export class ScryptEncryptor implements EncryptorProvider {
  private readonly saltRounds = 10;

  async hash(value: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(value, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    return result;
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    const [salt, originalHash] = hashed.split('.');

    if (!salt || !originalHash) {
      throw new Error('Invalid hashed format. Expected "salt.hash".');
    }

    const hash = (await scrypt(plain, salt, 32)) as Buffer;
    const newHash = hash.toString('hex');

    return newHash === originalHash;
  }
}