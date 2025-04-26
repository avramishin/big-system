import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';

@WebSocketGateway({ path: '/v1/ws' })
export class ApiGateway implements OnGatewayDisconnect, OnGatewayConnection {
  protected clients = new Map<string, any>();

  constructor() {}

  @SubscribeMessage('ping')
  async ping(client: any, payload: any) {
    return 'pong';
  }

  async handleConnection(client: any) {
    console.log('client conencted');
  }

  async handleDisconnect(client: any) {
    console.log('client disconnected');
  }
}
