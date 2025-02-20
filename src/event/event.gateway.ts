import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StockHistory } from 'src/database/schema/stockHistory.schema';
import { StockService } from 'src/stock/stock.service';
import { onTradeStockInput } from 'src/trade/dto/on-trade-stock.dto';
import { TradeService } from 'src/trade/trade.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private stockService: StockService,
    private tradeService: TradeService,
  ) {}

  @WebSocketServer()
  server: Server;

  // Client ID List
  private connectionClients: string[] = [];

  // Send Stock Info
  async broadCastStock(stock: StockHistory) {
    this.server.emit('stock', stock);
  }

  // Send Trade Info
  async broadCastTrade(trade: onTradeStockInput) {
    const result = await this.tradeService.getAllTrades(trade);
    this.server.emit('trade', result);
  }

  // send Trade History Info
  async broadCastTradeHistory(trade: onTradeStockInput) {
    const result = await this.tradeService.getTradeHistory(trade);
    this.server.emit('trade-history', result);
  }

  // Listen Stock Info
  @SubscribeMessage('sent-stock')
  async handleStockEvent(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📩 [sent-stock] 이벤트 감지됨!');
    console.log('📨 받은 메시지:', message);
    const stock = await this.stockService.getStockHistory(message);
    console.log('📨 보낼 메시지:', stock);
    this.server.emit('stock', stock);
  }

  // Listen Trade Info
  @SubscribeMessage('sent-trade')
  async handleTradeEvent(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📩 [sent-trade] 이벤트 감지됨!');
    console.log('📨 받은 메시지:', message);
    const input = { code: message };
    const trade = await this.tradeService.getAllTrades(input);
    console.log('📨 보낼 메시지:', trade);
    this.server.emit('trade', trade);
  }

  // Listen Trade History Info
  @SubscribeMessage('sent-trade-history')
  async handleTradeHistoryEvent(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('📩 [sent-trade-history] 이벤트 감지됨!');
    console.log('📨 받은 메시지:', message);
    const input = { code: message };
    const trade = await this.tradeService.getTradeHistory(input);
    console.log('📨 보낼 메시지:', trade);
    this.server.emit('trade-history', trade);
  }

  // Initialize WebSocket Server
  afterInit(server: Server) {
    console.log('WebSocket Server Initialized');
  }

  // Connection Client
  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected Client : ${client.id}`);
    this.addClient(client.id);
  }

  // Disconnect Client
  handleDisconnect(client: Socket) {
    console.log(`Disconnected Client : ${client.id}`);
    this.removeClient(client.id);
  }

  // Add Client
  private addClient(client: string) {
    this.connectionClients.push(client);
  }

  // Remove Client
  private removeClient(client: string) {
    const index = this.connectionClients.indexOf(client);
    if (index > -1) {
      this.connectionClients.splice(index, 1);
    }
  }
}
