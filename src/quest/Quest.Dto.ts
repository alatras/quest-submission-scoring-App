import { IsUUID, IsISO8601, IsArray, IsNotEmpty, IsString, ValidateNested, IsEnum, IsHexadecimal, IsPositive, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export enum OperatorType {
  contains = 'contains',
  notContains = 'notContains',
  lessThan = '<',
  greaterThan = '>',
  equals = '=',
}

export enum ConditionType {
  nft = 'nft',
  date = 'date',
  level = 'level',
}

export class Condition {
  @IsEnum(ConditionType)
  type: ConditionType;

  @IsEnum(OperatorType)
  operator: OperatorType;

  @IsString()
  value: string;
}

class UserData {
  @IsArray()
  @IsUUID(4, { each: true })
  completed_quests: string[];

  @IsArray()
  @IsHexadecimal({ each: true })
  nfts: string[];

  @IsInt()
  @IsPositive()
  level: number;
}

export class QuestDto {
  @IsUUID(4)
  questId: string;

  @IsUUID(4)
  userId: string;

  @IsISO8601()
  claimed_at: string;

  @ValidateNested({ each: true })
  @Type(() => Condition)
  access_condition: Condition[];

  @ValidateNested()
  @Type(() => UserData)
  user_data: UserData;

  @IsNotEmpty()
  @IsString()
  submission_text: string;
}
