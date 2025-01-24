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
import { Stock } from 'src/database/stock.entity';
import { Trade } from 'src/database/trade.entity';
import { StockInput } from 'src/stock/dto/stock.dto';
import { StockService } from 'src/stock/stock.service';
import { TradeInput } from 'src/trade/dto/trade.dto';
import { TradeService } from 'src/trade/trade.service';

@WebSocketGateway()
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
  broadCastStock(stock: Stock) {
    this.server.emit('stock', stock);
  }

  // Send Trade Info
  broadCastTrade(trade: Trade) {
    this.server.emit('trade', trade);
  }

  // Listen Stock Info
  @SubscribeMessage('subscribe-stock')
  handleStockEvent(@MessageBody() message: StockInput) {
    const stock = this.stockService.getStock(message);
    this.server.emit('stock', stock);
  }

  // Listen Trade Info
  @SubscribeMessage('subscribe-stock')
  handleTradeEvent(@MessageBody() message: TradeInput) {
    const trade = this.tradeService.getAllTrades(message);
    this.server.emit('trade', trade);
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
