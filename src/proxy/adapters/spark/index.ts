import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common/decorators';
import { ConfigType } from '@nestjs/config';
import { Subject } from 'rxjs';
import BasicProxyAdapter from 'src/proxy/adapters/BasicProxyAdapter';
import { formatRFC7231 } from 'date-fns';
import * as crypto from 'crypto';
import sparkConfig from './spark.config';
import * as WebSocket from 'ws';
@Injectable()
export default class SparkAiAdapter extends BasicProxyAdapter {
  constructor(
    private readonly httpService: HttpService,
    @Inject(sparkConfig.KEY) private aiConfig: ConfigType<typeof sparkConfig>,
  ) {
    super();
  }
  async isHealthy(): Promise<boolean> {
    try {
      await this.proxy(
        {
          header: {
            app_id: this.aiConfig.appId,
            uid: '0',
          },
          parameter: {
            chat: {
              domain: 'generalv3.5',
              temperature: 0.5,
              max_tokens: 1024,
            },
          },
          payload: {
            message: {
              text: [
                {
                  role: 'system',
                  content: '这是一个测试接口连通性的请求，返回TRUE即可',
                },
              ],
            },
          },
        },
        'v3.5/chat',
      );
      return true;
    } catch (e) {
      return false;
    }
  }
  async getModels(): Promise<any[]> {
    return ['general', 'generalv2', 'generalv3', 'generalv3.5'];
  }
  async getRequestHead(path): Promise<any> {
    const APIKey = this.aiConfig.apiKey;
    const APISecret = this.aiConfig.apiSecret;
    const host = this.aiConfig.baseUrl;
    const date = formatRFC7231(new Date());

    // 生成签名字符串
    const tmp = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;

    // 使用 hmac-sha256 算法和 APISecret 对签名字符串进行签名
    const tmp_sha = crypto.createHmac('sha256', APISecret).update(tmp).digest();

    // 进行 base64 编码生成 signature
    const signature = tmp_sha.toString('base64');

    // 拼接 authorization_origin 字符串
    const authorization_origin = `api_key="${APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

    // 进行 base64 编码生成最终的 authorization
    const authorization = Buffer.from(authorization_origin).toString('base64');
    // 返回最终的请求头
    return {
      host,
      date,
      authorization,
    };
  }
  async proxy(data: any, path: string): Promise<any> {
    // 获取请求头
    const head = await this.getRequestHead('/' + path);
    const link = `wss://${head.host}/${path}?authorization=${encodeURI(
      head.authorization,
    )}&date=${encodeURIComponent(head.date).replace(
      /%20/g,
      '+',
    )}&host=${encodeURI(head.host)}`;
    const ws = new WebSocket(link);

    // 创建一个 Subject
    const subject = new Subject();

    // 监听连接打开事件
    ws.on('open', () => {
      // 连接打开后发送数据
      ws.send(JSON.stringify(data));
    });

    // 监听消息事件
    ws.on('message', (message) => {
      const data = JSON.parse(message.toString());
      if (data?.payload?.usage) {
        console.log(
          `This request consumed ${data.payload.usage.text?.total_tokens} tokens.`,
        );
      }
      // 解析接收到的消息 是BUFFER
      // 将接收到的消息推送到 Subject 中
      subject.next(message);
    });

    // 监听错误事件
    ws.on('error', (error) => {
      // 在发生错误时，将错误推送到 Subject 中
      subject.error(error);
    });

    // 监听关闭事件
    ws.on('close', (code, reason) => {
      console.log('close', code, reason);
      // 当连接关闭时，结束 Subject
      subject.complete();
    });

    // 返回 Subject 的 Observable
    return subject.asObservable();
  }
}
