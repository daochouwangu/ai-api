import { Controller } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import {
  Get,
  Query,
  UseInterceptors,
  Req,
  All,
} from '@nestjs/common/decorators';
import { LoggingInterceptor } from './intercepts/log.intercept';

@Controller('proxy')
@UseInterceptors(LoggingInterceptor)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('health')
  async getAiHealthy(@Query('plateform') plateform: string) {
    return await this.proxyService.isHealthy(plateform);
  }

  @Get('models')
  async getAiModels(@Query('plateform') plateform: string) {
    return await this.proxyService.getModels(plateform);
  }

  @All('*')
  async proxy(@Req() req) {
    const plateform = req.query.plateform;
    const body = req.body;
    const path = req.params['*'];
    console.log('in');
    return await this.proxyService.proxy(plateform, body, path);
  }
}
