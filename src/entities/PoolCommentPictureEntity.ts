import { Entity, ManyToOne } from "@mikro-orm/core";
import { BasePictureEntity, type PictureSizeType } from "./BasePictureEntity";
import { PoolCommentEntity } from "./PoolCommentEntity";

@Entity({discriminatorValue: 'pool_comment'})
export class PoolCommentPictureEntity extends BasePictureEntity {

    @ManyToOne({fieldName: 'comment_uuid', 
               entity: () => PoolCommentEntity, 
               nullable: false, 
               eager: false})
    comment!: PoolCommentEntity;

    constructor(size_type: PictureSizeType, 
                width: number, 
                height: number, 
                path_name: string) {

        super(size_type, width, height, path_name);
        this.type = 'pool_comment';
    }
}