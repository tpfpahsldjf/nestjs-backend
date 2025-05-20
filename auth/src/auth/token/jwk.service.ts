import { pem2jwk } from 'pem-jwk';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { generateKeyPairSync } from 'crypto';
import { v4 as uuid } from 'uuid';
import { JwkSchemaClass } from './jwk.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwkService {
  private _publicKey: string;
  private _privateKey: string;
  private _publicJwk: Record<string, any>;

  constructor(
    @InjectModel(JwkSchemaClass.name)
    private readonly jwkModel: Model<JwkSchemaClass>,
  ) {}

  get publicKey(): string {
    return this._publicKey;
  }

  get privateKey(): string {
    return this._privateKey;
  }

  get publicJwk(): Record<string, any> {
    return this._publicJwk;
  }
  public async initialize(): Promise<void> {

    const existing = await this.jwkModel.findOne().lean().exec();

    if (existing) {
      this._publicKey = existing.publicKey;
      this._privateKey = existing.privateKey;
      this._publicJwk = existing.publicJwk;
      return;
    }

    const { publicKey, privateKey, jwk } = this.generateRsaKeyPair();

    await this.jwkModel.create({ publicKey, privateKey, publicJwk: jwk });

    this._publicKey = publicKey;
    this._privateKey = privateKey;
    this._publicJwk = jwk;
  }

  private generateRsaKeyPair(modulusLength = 2048): {
    publicKey: string;
    privateKey: string;
    jwk: Record<string, any>;
  } {
    //해당 정보들은 노출해봐야 좋을거없고 바뀔이유도없어서 하드코딩이 맞다고 보임
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const jwk = pem2jwk(publicKey);
    jwk.kid = uuid();
    jwk.use = 'sig';
    jwk.alg = 'RS256';
    jwk.kty = 'RSA';

    return { publicKey, privateKey, jwk };
  }
}
