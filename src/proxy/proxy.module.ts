import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import openaiConfig from './adapters/openai/openai.config';
import OpenAiAdapter from './adapters/openai';
import sparkConfig from './adapters/spark/spark.config';
import SparkAiAdapter from './adapters/spark';
import { BullModule } from '@nestjs/bull';
import { TokenUsagesQueue } from './token-usage.processor';

@Module({
  imports: [
    HttpModule.register({}),
    ConfigModule.forRoot({
      load: [openaiConfig, sparkConfig],
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'token-usage',
    }),
  ],
  controllers: [ProxyController],
  providers: [ProxyService, OpenAiAdapter, SparkAiAdapter, TokenUsagesQueue],
})
export class ProxyModule {}
