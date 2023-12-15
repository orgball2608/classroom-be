import { GatewaySessionManager } from './gateway.session';
import { Module } from '@nestjs/common';
import { PROVIDERS } from '@src/constants';
import { WsGateway } from './gateway';

@Module({
  providers: [
    WsGateway,
    {
      provide: PROVIDERS.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager,
    },
  ],
  exports: [],
})
export class GatewayModule {}
