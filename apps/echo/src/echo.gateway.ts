import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { ConfigService } from '@nestjs/config';

import crypto from 'crypto';
import debug from 'debug';

@WebSocketGateway()
export class EchoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private PING_INTERVAL = 30000;
  private PONG_TIMEOUT = 10000;

  private clients: Map<WebSocket, NodeJS.Timeout> = new Map();
  private debug = debug(EchoGateway.name);

  constructor(private configService: ConfigService) {}

  handleConnection(client: WebSocket, request: IncomingMessage) {
    try {
      (client as any).id = crypto.randomBytes(4).toString('hex');
      const credentials = this.extractCredentials(request);
      if (
        credentials?.clusterSecurityKey !=
        this.configService.get('ECHO_CLUSTER_SECURITY_KEY')
      ) {
        this.debug('CLIENT_UNAUTHORIZED %o', {
          client_id: (client as any).id,
          credentials,
        });
        client.close(4401, 'UNAUTHORIZED');
        return;
      }

      (client as any).credentials = credentials;

      this.debug('CLIENT_CONN %o', {
        service: credentials.clusterService,
        client_id: (client as any).id,
      });

      client.on('pong', () => this.handlePong(client));

      this.setupPingInterval(client);

      client.on('message', (message: Buffer) => {
        try {
          this.broadcast(message.toString());
        } catch (e) {
          this.debug('BROADCAST_ERROR %o', {
            error: e.message || e,
            message,
            client_id: (client as any).id,
          });
        }
      });

      this.debug('CONNECTED_CLIENTS %s', this.clients.size);
    } catch (e) {
      this.debug('INIT_CONN_ERROR %o', {
        error: e.message || e,
        client_id: (client as any).id,
      });
      client.close(4403, 'Forbidden');
    }
  }

  private setupPingInterval(client: WebSocket) {
    this.cleanupPingInterval(client);
    this.sendPing(client);

    const interval = setInterval(() => {
      this.sendPing(client);
    }, this.PING_INTERVAL);

    this.clients.set(client, interval);
  }

  handleDisconnect(client: WebSocket) {
    this.debug('CLIENT_DICCONN %o', {
      service: (client as any).credentials?.clusterService,
      client_id: (client as any).id,
    });

    this.cleanupClient(client);
  }

  private handlePong(client: WebSocket) {
    this.debug('GOT_PONG %s', (client as any).id);

    const timeout = (client as any).pingTimeout;

    if (timeout) {
      clearTimeout(timeout);
      (client as any).pingTimeout = null;
    }
  }

  private sendPing(client: WebSocket) {
    this.debug('SEND_PING %s', (client as any).id);

    if (client.readyState !== WebSocket.OPEN) {
      this.debug('SOCK_NO_OPEN_ON_PING %s', (client as any).id);
      client.terminate();
      return;
    }

    client.ping();

    const timeout = setTimeout(() => {
      this.debug('NO_PONG_RECEIVED %s', (client as any).id);
      client.terminate();
    }, this.PONG_TIMEOUT);

    (client as any).pingTimeout = timeout;
  }

  private cleanupPingInterval(client: WebSocket) {
    const interval = this.clients.get(client);
    if (interval) {
      clearInterval(interval);
    }
  }

  private cleanupClient(client: WebSocket) {
    this.debug('CLEANUP_CLIENT %s', (client as any).id);
    this.cleanupPingInterval(client);
    const timeout = (client as any).pingTimeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    this.clients.delete(client);
    this.debug('CONNECTED_CLIENTS %s', this.clients.size);
  }

  private broadcast(message: string) {
    this.clients.forEach((_, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else {
        this.debug('SOCK_NO_OPEN_ON_BROADCAST %s', (client as any).id);
        client.terminate();
      }
    });
  }

  private extractCredentials(
    request: IncomingMessage,
  ): { clusterSecurityKey: string; clusterService: string } | null {
    const url = new URL(request.url, `http://${request.headers.host}`);
    let clusterSecurityKey: string;
    let clusterService: string;

    clusterSecurityKey = url.searchParams.get('cluster_security_key');
    clusterService = url.searchParams.get('cluster_service');

    if (clusterSecurityKey && clusterService) {
      return {
        clusterSecurityKey,
        clusterService,
      };
    }

    clusterSecurityKey = request.headers['x-cluster-security-key'] as string;
    clusterService = request.headers['x-cluster-service'] as string;

    if (clusterSecurityKey && clusterService) {
      return {
        clusterSecurityKey,
        clusterService,
      };
    }

    return null;
  }
}
