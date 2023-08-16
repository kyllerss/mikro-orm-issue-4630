import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { BaseUUIDEntity } from "./BaseUUIDEntity";

export type PictureType = 'track_comment' | 'pool_comment';
export type PictureSizeType = 'full' | 'thumbnail';

export interface PictureData {

    size_type: PictureSizeType; 
    width: number;
    height: number;
    path_name: string;
}

@Entity({
    tableName: 'pictures',
    discriminatorColumn: 'type',
    abstract: true,
  })
export abstract class BasePictureEntity extends BaseUUIDEntity implements PictureData {

    @Enum({type: 'varchar', nullable: false})
    type!: PictureType; 

    @Enum({type: 'varchar', nullable: false})
    size_type: PictureSizeType; 

    @Property({type: 'datetime'})
    creation_timestamp: Date = new Date();
  
    @Property({type: 'number'})
    width: number;
    
    @Property({type: 'number'})
    height: number;

    @Property({type: 'string'})
    path_name: string;

    constructor(size_type: PictureSizeType, 
                width: number, 
                height: number, 
                path_name: string) {

        super();
        
        this.size_type = size_type;
        this.width = width;
        this.height = height;
        this.path_name = path_name;
    }
}