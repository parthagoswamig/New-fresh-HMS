import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
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

  @Get('health')
  getHealthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
