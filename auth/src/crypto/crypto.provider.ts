export interface EncryptorProvider {
  hash(value: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export const ENCRYPTOR_PROVIDER = 'ENCRYPTOR_PROVIDER';
