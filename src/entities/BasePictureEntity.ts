import { Entity, Enum } from "@mikro-orm/core";
import { BaseUUIDEntity } from "./BaseUUIDEntity";

export type PictureType = 'track_comment' | 'pool_comment';

export interface PictureData {}

@Entity({
    tableName: 'pictures',
    discriminatorColumn: 'type',
    abstract: true,
  })
export abstract class BasePictureEntity extends BaseUUIDEntity implements PictureData {

    @Enum({type: 'varchar', nullable: false})
    type!: PictureType; 
}