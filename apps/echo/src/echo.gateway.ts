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
  private _d = debug(EchoGateway.name);

  constructor(private configService: ConfigService) {}

  handleConnection(client: WebSocket, request: IncomingMessage) {
    try {
      const creds = this.extractCredentials(request);
      (client as any).id = crypto.randomBytes(4).toString('hex');
      if (creds?.cck != this.configService.get('CLUSTER_CLIENT_KEY')) {
        this._d('CLIENT_UNAUTHORIZED %o', {
          client_id: (client as any).id,
          creds,
        });
        client.close(3000, 'UNAUTHORIZED');
        return;
      }

      (client as any).cck = creds.cck;
      (client as any).ccn = creds.ccn;

      this._d('CLIENT_CONN %o', {
        id: (client as any).id,
        ccn: creds.ccn,
      });

      client.on('pong', () => this.handlePong(client));

      this.setupPingInterval(client);

      client.on('message', (msg: Buffer) => {
        try {
          this.broadcast(msg.toString());
        } catch (e) {
          this._d('BROADCAST_ERROR %o', {
            id: (client as any).id,
            ccn: (client as any).ccn,
            error: e.message || e,
            msg,
          });
        }
      });

      this._d('CONNECTED_CLIENTS %s', this.clients.size);
    } catch (e) {
      this._d('INIT_CONN_ERROR %o', {
        id: (client as any).id,
        ccn: (client as any).ccn,
        error: e.message || e,
      });

      client.close(4001, 'INIT_CONN_ERROR');
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
    this._d('CLIENT_DICCONN %o', {
      id: (client as any).id,
      ccn: (client as any).ccn,
    });

    this.cleanupClient(client);
  }

  private handlePong(client: WebSocket) {
    this._d('GOT_PONG %s', (client as any).id);

    const timeout = (client as any).pingTimeout;

    if (timeout) {
      clearTimeout(timeout);
      (client as any).pingTimeout = null;
    }
  }

  private sendPing(client: WebSocket) {
    this._d('SEND_PING %s', (client as any).id);

    if (client.readyState !== WebSocket.OPEN) {
      this._d('SOCK_NO_OPEN_ON_PING %s', (client as any).id);
      client.terminate();
      return;
    }

    client.ping();

    const timeout = setTimeout(() => {
      this._d('NO_PONG_RECEIVED %s', (client as any).id);
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
    this._d('CLEANUP_CLIENT %s', (client as any).id);
    this.cleanupPingInterval(client);
    const timeout = (client as any).pingTimeout;
    if (timeout) {
      clearTimeout(timeout);
    }
    this.clients.delete(client);
    this._d('CONNECTED_CLIENTS %s', this.clients.size);
  }

  private broadcast(message: string) {
    this.clients.forEach((_, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else {
        this._d('SOCK_NO_OPEN_ON_BROADCAST %s', (client as any).id);
        client.terminate();
      }
    });
  }

  private extractCredentials(
    request: IncomingMessage,
  ): { cck: string; ccn: string } | null {
    const url = new URL(request.url, `http://${request.headers.host}`);

    const result = {
      cck: null,
      ccn: null,
    };

    result.cck = url.searchParams.get('cck');
    result.ccn = url.searchParams.get('ccn');

    if (result.cck && result.ccn) {
      return result;
    }

    result.cck = request.headers['x-cck'] as string;
    result.cck = request.headers['x-ccn'] as string;

    return result;
  }
}
