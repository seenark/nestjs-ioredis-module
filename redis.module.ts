import {
  DynamicModule,
  FactoryProvider,
  Module,
  ModuleMetadata,
  Provider,
} from "@nestjs/common";
import IORedis, { Redis, RedisOptions } from "ioredis";

/**
 * to be using the IORedis provider please inject IOREDIS_KEY into constructor
 * @Inject(IOREDIS_KEY) ioredis: Redis
 *
 */
export const IOREDIS_KEY = "IORedis";

type RedisModuleOptions = {
  connectionOptions: RedisOptions;
  onClientReady?: (client: Redis) => void;
};

type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, "imports"> &
  Pick<FactoryProvider, "inject">;

@Module({})
export class RedisModule {
  static register(options: RedisModuleOptions): DynamicModule {
    const client = new IORedis(options.connectionOptions);
    options.onClientReady(client);
    const redisProvider: Provider<IORedis> = {
      provide: IOREDIS_KEY,
      useValue: client,
    };
    return {
      module: RedisModule,
      providers: [redisProvider],
      imports: [],
      exports: [redisProvider],
      controllers: [],
    };
  }
  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    const redisProvider: Provider<IORedis> = {
      provide: IOREDIS_KEY,
      useFactory: async (...args) => {
        const { connectionOptions, onClientReady } = await useFactory(...args);
        const client = new IORedis(connectionOptions);

        onClientReady(client);

        return client;
      },
      inject: inject,
    };

    return {
      module: RedisModule,
      imports: imports,
      providers: [redisProvider],
      exports: [redisProvider],
      global: true,
    };
  }
}
