import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import openaiConfig from './adapters/openai/openai.config';
import { AdapterType } from './adapters/Adapters';

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({}),
        ConfigModule.forRoot({
          load: [openaiConfig],
        }),
      ],
      providers: [ProxyService],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 测试是否联通openai
  it('should be able to connect to openai', async () => {
    const result = await service.isHealthy(AdapterType.OPENAI);
    expect(result).toEqual(true);
  });
});
