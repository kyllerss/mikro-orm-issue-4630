import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

export type CommentType = 'track' | 'pool';

@Entity({
    tableName: 'comments',
    discriminatorColumn: 'type',
    abstract: true,
  })
export abstract class BaseCommentEntity {

    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    uuid!: string;

    @Property({type: 'string'})
    message: string;

    @Enum({type: 'varchar', nullable: false})
    type!: CommentType; 

    @Property({type: 'datetime'})
    creation_timestamp: Date = new Date();
  
    @Property({type: 'datetime'})
    last_modified_timestamp: Date = new Date();

    abstract pictures: any;

    constructor(text: string) {

        this.message = text;
    }
}