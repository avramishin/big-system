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
      msg: 'CLIENT_CONN',
      ctx: {
        id: client.id,
        svc: client.data.cluster_service,
        cc: this.server.engine.clientsCount,
      },
      exp: MonologLogTtl.min_1,
    });
  }

  async handleDisconnect(client: Socket) {
    this.monolog.register({
      msg: 'CLIENT_DICONN',
      ctx: {
        id: client.id,
        svc: client.data.cluster_service,
        cc: this.server.engine.clientsCount,
      },
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
      msg: 'CLIENT_SUB',
      ctx: { id: client.id, topic, service: client.data.cluster_service },
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
      msg: 'CLIENT_UNSUB',
      ctx: { id: client.id, topic, service: client.data.cluster_service },
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
      ctx: {
        id: client.id,
        topic: data.topic,
        service: client.data.cluster_service,
      },
      exp: MonologLogTtl.min_1,
    });

    this.server.to(data.topic).emit('event.receive', data.payload);
  }
}
