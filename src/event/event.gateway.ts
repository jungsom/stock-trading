import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/event',
  cors: {
    origin: '*',
  },
})
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}

  @WebSocketServer()
  server: Server;

  private connectionClients: string[] = [];

  @SubscribeMessage('events')
  handleEvent(@MessageBody() message: string): string {
    this.server.emit('events', message);
    return message;
  }

  afterInit(server: Server) {
    console.log('웹소켓 서버 초기화');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`클라이언트 연결됨: ${client.id}`);
    this.addClient(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`클라이언트 연결 해제됨: ${client.id}`);
    this.removeClient(client.id);
  }

  // 클라이언트 추가
  private addClient(client: string) {
    this.connectionClients.push(client);
  }

  // 클라이언트 제거
  private removeClient(client: string) {
    const index = this.connectionClients.indexOf(client);
    if (index > -1) {
      this.connectionClients.splice(index, 1);
    }
  }
}
