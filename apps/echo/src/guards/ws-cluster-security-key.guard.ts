import { ConfigService } from '@nestjs/config';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsClusterSecurityKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const currentKey = client.handshake.auth?.clusterSecurityKey;
    const clusterKey = this.configService.get('ECHO_CLUSTER_SECURITY_KEY');

    if (!currentKey || clusterKey != currentKey) {
      client.emit('error', 'UNAUTHORIZED');
      client.disconnect();
      return false;
    }

    return true;
  }
}
