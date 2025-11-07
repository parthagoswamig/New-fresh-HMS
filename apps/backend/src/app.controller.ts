import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'CareStack API is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        docs: '/docs',
        auth: '/auth',
        tenants: '/tenants',
      },
    };
  }

  @Public()
  @Get('health')
  getHealthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
