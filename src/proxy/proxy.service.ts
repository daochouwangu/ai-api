import { Injectable } from '@nestjs/common';
import OpenAiAdapter from './adapters/openai';
import { AdapterType } from './adapters/Adapters';
import SparkAiAdapter from './adapters/spark';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ProxyService {
  constructor(
    @InjectQueue('token-usage') private queue: Queue,
    private readonly openaiAdapter: OpenAiAdapter,
    private readonly sparkAiAdapter: SparkAiAdapter,
  ) {}
  async getJobs() {
    const jobs = await this.queue.getJobs(
      ['waiting', 'delayed', 'paused', 'active', 'completed', 'failed'],
      0,
      -1,
    );
    console.log(jobs);
    return jobs;
  }
  async isHealthy(plateform: string): Promise<boolean> {
    this.getJobs();
    switch (plateform) {
      case AdapterType.OPENAI:
        return await this.openaiAdapter.isHealthy();
      case AdapterType.SPARK:
        return await this.sparkAiAdapter.isHealthy();
      default:
        return false;
    }
  }
  async getModels(plateform: string): Promise<any> {
    switch (plateform) {
      case AdapterType.OPENAI:
        return await this.openaiAdapter.getModels();
      case AdapterType.SPARK:
        return await this.sparkAiAdapter.getModels();
      default:
        return false;
    }
  }
  async proxy(plateform: string, data: any, path: string): Promise<any> {
    debugger;
    switch (plateform) {
      case AdapterType.OPENAI:
        return await this.openaiAdapter.proxy(data, path);
      case AdapterType.SPARK:
        return await this.sparkAiAdapter.proxy(data, path);
      default:
        return false;
    }
  }
}
