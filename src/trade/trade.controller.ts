import { Controller, Post } from "@nestjs/common";
import { TradeService } from "./trade.service";
import { TradeInput, TradeOutput } from "./dto/trade.dto";

@Controller('trade')
export class TradeController {
    constructor(private readonly tradeService: TradeService) {}

    @Post()
    postTrade(input: TradeInput): Promise<TradeOutput> {
    return this.tradeService.tradeStock(input);
    }
}