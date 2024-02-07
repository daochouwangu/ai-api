import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common/decorators';
import { ConfigType } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import BasicProxyAdapter from 'src/proxy/adapters/BasicProxyAdapter';
import openaiConfig from './openai.config';
import { OpenAiModel } from './types';

@Injectable()
export default class OpenAiAdapter extends BasicProxyAdapter {
  constructor(
    private readonly httpService: HttpService,
    @Inject(openaiConfig.KEY) private aiConfig: ConfigType<typeof openaiConfig>,
  ) {
    super();
  }
  async isHealthy(): Promise<boolean> {
    try {
      await this.getModels();
      return true;
    } catch (e) {
      return false;
    }
  }
  async getModels(): Promise<OpenAiModel[]> {
    const res = await lastValueFrom(
      this.httpService.get(this.aiConfig.baseUrl + 'models', {
        headers: {
          Authorization: `Bearer ${this.aiConfig.apiKey}`,
        },
      }),
    );
    return res.data.data;
  }
  async proxy(data: any, path: string): Promise<any> {
    // 记录token
    return this.httpService
      .post(this.aiConfig.baseUrl + path, data, {
        headers: {
          Authorization: `Bearer ${this.aiConfig.apiKey}`,
        },
      })
      .pipe(
        map((res) => {
          // 提取响应体和响应头
          const { data } = res;

          // 如果需要，你还可以在这里处理 token 使用量
          const usage = data?.usage?.total_tokens;
          console.log(`This request consumed ${usage} tokens.`);

          // 最后，返回你关心的数据
          return data;
        }),
      );
  }
}

export { OpenAiModel } from './types';
