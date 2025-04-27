import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { WsClusterSecurityKeyGuard } from './guards/ws-cluster-security-key.guard';
import { Inject, UseGuards } from '@nestjs/common';
import { MonologClient } from '../../monolog/src/monolog.client';
import { MonologLogTtl } from '../../monolog/src/enums/monolog-log-ttl.enum';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EchoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@Inject('monolog') private monolog: MonologClient) {}

  async handleConnection(client: Socket) {
    this.monolog.register({
      msg: 'CLIENT_CONNECTED',
      ctx: client.id,
      exp: MonologLogTtl.min_1,
    });
  }

  async handleDisconnect(client: Socket) {
    this.monolog.register({
      msg: 'CLIENT_DICONNECTED',
      ctx: client.id,
      exp: MonologLogTtl.min_1,
    });
  }

  @UseGuards(WsClusterSecurityKeyGuard)
  @SubscribeMessage('topic.subscribe')
  handleSubscribe(
    @MessageBody() topic: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.monolog.register({
      msg: 'CLIENT_SUBSCRIBE',
      ctx: [client.id, topic],
      exp: MonologLogTtl.min_1,
    });
    client.join(topic);
  }

  @UseGuards(WsClusterSecurityKeyGuard)
  @SubscribeMessage('topic.unsubscribe')
  handleUnsubscribe(
    @MessageBody() topic: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.monolog.register({
      msg: 'CLIENT_UNSUBSCRIBE',
      ctx: [client.id, topic],
      exp: MonologLogTtl.min_1,
    });

    client.leave(topic);
  }

  @UseGuards(WsClusterSecurityKeyGuard)
  @SubscribeMessage('event.send')
  handleEventSend(
    @MessageBody() data: { topic: string; payload: any },
    @ConnectedSocket() client: Socket,
  ) {
    this.monolog.register({
      msg: 'CLIENT_SEND',
      ctx: [client.id, data.topic],
      exp: MonologLogTtl.min_1,
    });

    this.server.to(data.topic).emit('event.receive', data.payload);
  }
}
