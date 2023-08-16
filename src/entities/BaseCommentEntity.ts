import { Entity, Enum, PrimaryKey } from "@mikro-orm/core";

export type CommentType = 'track' | 'pool';

@Entity({
    tableName: 'comments',
    discriminatorColumn: 'type',
    abstract: true,
  })
export abstract class BaseCommentEntity {

    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    uuid!: string;

    @Enum({type: 'varchar', nullable: false})
    type!: CommentType; 

    abstract pictures: any;
}