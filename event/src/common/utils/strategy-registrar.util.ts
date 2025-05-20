import { DiscoveryService, Reflector } from '@nestjs/core';

export function registerStrategies<K extends string, S>(
  discoveryService: DiscoveryService,
  reflector: Reflector,
  metadataKey: string,
): Record<K, S> {
  const strategies: Partial<Record<K, S>> = {};

  const providers = discoveryService.getProviders();
  for (const wrapper of providers) {
    const { instance } = wrapper;
    if (!instance) continue;

    const key = reflector.get<K>(metadataKey, instance.constructor);
    if (key) {
      strategies[key] = instance as S;
    }
  }

  return strategies as Record<K, S>;
}