import { IsEnum, IsOptional } from 'class-validator';

export enum AnalyticsPeriod {
  LAST_7_DAYS = 'last7days',
  LAST_30_DAYS = 'last30days',
  LAST_90_DAYS = 'last90days',
  LAST_YEAR = 'lastYear',
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS;
}
