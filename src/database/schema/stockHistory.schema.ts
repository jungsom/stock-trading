import { BaseEntity } from '../entity/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type StockHistoryDocument = HydratedDocument<StockHistory>;

@Schema({ collection: 'stock-history', timestamps: true })
export class StockHistory extends BaseEntity {
  /** 종목 코드 */
  @Prop()
  code: string;

  /** 날짜 */
  @Prop()
  date: Date;

  /** 현재가 */
  @Prop()
  currentPrice: number;

  /** 시가 */
  @Prop()
  openPrice: number;

  /** 종가 */
  @Prop()
  closePrice: number;

  /** 고가 */
  @Prop()
  highPrice: number;

  /** 저가 */
  @Prop()
  lowPrice: number;

  /** 거래량 */
  @Prop()
  volume: number;

  // /** 전날 종가 대비 */
  // @Prop()
  // contrastPrice?: number;

  // /** 등락률 */
  // @Prop()
  // flucRate?: number;

  // /** 시가총액 */
  // @Prop()
  // marketCap?: number;

  @Prop({ type: mongoose.Schema.Types.Date, name: 'deleted_at', default: null })
  deletedAt?: Date | null;
}

export const StockHistorySchema = SchemaFactory.createForClass(StockHistory);
