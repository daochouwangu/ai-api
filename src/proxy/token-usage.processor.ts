import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AdapterType } from './adapters/Adapters';
@Processor('token-usage')
export class TokenUsagesQueue {
  constructor() {}

  @Process('use')
  async handleTokenUsages(job: Job<TokenUsagesJobData>) {
    console.log(job);
    const { data } = job;
    const { plateform, usage, time, userId } = data;
    console.log(
      `User ${userId} used ${usage} tokens in ${time}ms on ${plateform}.`,
    );
  }
}
export interface TokenUsagesJobData {
  plateform: AdapterType;
  usage: number;
  time: number;
  userId: string;
}
