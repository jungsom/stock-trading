import { Controller, Post } from "@nestjs/common";
import { TradeService } from "./trade.service";
import { TradeInput, TradeOutput } from "./dto/trade.dto";

@Controller()
export class TradeController {
    constructor(private readonly tradeService: TradeService) {}

    @Post()
    postTrade(input: TradeInput): Promise<TradeOutput> {
        if (input.type == "BUY") {
            return this.tradeService.buyStock(input);
        }

        if (input.type == "SELL") {
            return this.tradeService.sellStock(input);
        }
    }
}