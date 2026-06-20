import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;
let _ipLimiter: Ratelimit | null = null;
let _booksRescueIpLimiter: Ratelimit | null = null;

function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

function getIpLimiter(): Ratelimit {
  if (!_ipLimiter) {
    _ipLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'rl:bbt-landing:ip',
    });
  }
  return _ipLimiter;
}

function getBooksRescueIpLimiter(): Ratelimit {
  if (!_booksRescueIpLimiter) {
    _booksRescueIpLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: 'rl:books-rescue:ip',
    });
  }
  return _booksRescueIpLimiter;
}

export async function checkLandingIpLimit(ip: string) {
  try {
    return await getIpLimiter().limit(ip);
  } catch (err) {
    console.error('[ratelimit] failed — failing open:', err);
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
      pending: Promise.resolve(),
    };
  }
}

export async function checkBooksRescueIpLimit(ip: string) {
  try {
    return await getBooksRescueIpLimiter().limit(ip);
  } catch (err) {
    console.error('[ratelimit] books-rescue failed — failing open:', err);
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
      pending: Promise.resolve(),
    };
  }
}
