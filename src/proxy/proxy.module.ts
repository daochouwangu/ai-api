import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import openaiConfig from './adapters/openai/openai.config';
import OpenAiAdapter from './adapters/openai';
import sparkConfig from './adapters/spark/spark.config';
import SparkAiAdapter from './adapters/spark';

@Module({
  imports: [
    HttpModule.register({}),
    ConfigModule.forRoot({
      load: [openaiConfig, sparkConfig],
    }),
  ],
  controllers: [ProxyController],
  providers: [ProxyService, OpenAiAdapter, SparkAiAdapter],
})
export class ProxyModule {}
