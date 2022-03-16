import { IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { mapEnvironmentKeys } from './utils';

export class Environment {
  @IsString()
  ENV: string = undefined;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  PORT: number = undefined;

  @IsString()
  DB_URI: string = undefined;
}

export const ENV = mapEnvironmentKeys<Environment>(Environment);
