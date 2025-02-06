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
import { StockHistoryInput } from 'src/stock/dto/stock-history.dto';
import { StockInput } from 'src/stock/dto/stock.dto';
import { StockService } from 'src/stock/stock.service';
import { onTradeStockInput } from 'src/trade/dto/on-trade-stock.dto';
import { TradeService } from 'src/trade/trade.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
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

  // Listen Stock Info
  @SubscribeMessage('sent-stock')
  async handleStockEvent(
    @MessageBody() message: onTradeStockInput,
    @ConnectedSocket() client: Socket,
  ) {
    const stock = await this.stockService.getStockHistory(message);
    client.emit('stock', stock);
  }

  // Listen Trade Info
  @SubscribeMessage('sent-trade')
  async handleTradeEvent(
    @MessageBody() message: onTradeStockInput,
    @ConnectedSocket() client: Socket,
  ) {
    const trade = await this.tradeService.getAllTrades(message);
    client.emit('trade', trade);
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
