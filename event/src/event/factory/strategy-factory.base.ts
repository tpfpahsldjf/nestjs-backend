import { OnModuleInit, Type, Injectable } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

@Injectable()
export abstract class StrategyFactory<K extends string, S>
  implements OnModuleInit
{
  protected strategies: Record<K, S> = {} as any;

  protected abstract readonly metadataKey: string;

  constructor(
    protected readonly discoveryService: DiscoveryService,
    protected readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const { instance } = wrapper;
      if (!instance) continue;

      const key = this.reflector.get<K>(this.metadataKey, instance.constructor);
      if (key) {
        this.strategies[key] = instance as S;
      }
    }
  }

  getStrategy(type: K): S {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`No strategy registered for type: ${type}`);
    }
    return strategy;
  }
}