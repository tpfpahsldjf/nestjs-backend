import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheUtil {
  constructor(@Inject('CACHE_MANAGER') private readonly cache: Cache) {}

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached) return cached;

    const result = await fetcher();

    if (this.isValidCacheValue(result)) {
      await this.cache.set(key, result, ttlSeconds * 1000);
    }

    return result;
  }

  private isValidCacheValue(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  public async invalidate(key: string): Promise<void> {
    await this.cache.del(key);
  }

  public async clearAll(): Promise<void> {
    if ('reset' in this.cache) {
      await (this.cache as any).reset();
    }
  }
}