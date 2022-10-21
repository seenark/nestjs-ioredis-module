import { Inject, Injectable } from "@nestjs/common";
import IORedis from "ioredis";
import { IOREDIS_KEY } from "./redis.module";

@Injectable()
export class RedisService {
  constructor(@Inject(IOREDIS_KEY) private redis: IORedis) {}

  async get<T>(key: string): Promise<T> {
    const data = await this.redis.get(key);
    const newData: T = JSON.parse(data);
    return newData;
  }

  async set<T>(key: string, data: T, ttlInSecond: number): Promise<"OK"> {
    const str = JSON.stringify(data);
    return this.redis.setex(key, ttlInSecond, str);
  }
}
