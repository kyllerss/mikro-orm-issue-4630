import { Entity, ManyToOne } from "@mikro-orm/core";
import { BasePictureEntity } from "./BasePictureEntity";
import { PoolCommentEntity } from "./PoolCommentEntity";

@Entity({discriminatorValue: 'pool_comment'})
export class PoolCommentPictureEntity extends BasePictureEntity {

    @ManyToOne({fieldName: 'comment_uuid', 
               entity: () => PoolCommentEntity, 
               nullable: false, 
               eager: false})
    comment!: PoolCommentEntity;

    constructor() {

        super();
        this.type = 'pool_comment';
    }
}