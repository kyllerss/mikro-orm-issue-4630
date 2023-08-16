import { Entity, ManyToOne } from "@mikro-orm/core";
import { BasePictureEntity, type PictureSizeType } from "./BasePictureEntity";
import { TrackCommentEntity } from "./TrackCommentEntity";

@Entity({discriminatorValue: 'track_comment'})
export class TrackCommentPictureEntity extends BasePictureEntity {

    @ManyToOne({fieldName: 'comment_uuid', 
               entity: () => TrackCommentEntity, 
               nullable: false, 
               eager: true})
    comment!: TrackCommentEntity;

    constructor(size_type: PictureSizeType, 
                width: number, 
                height: number, 
                path_name: string) {

        super(size_type, width, height, path_name);
        this.type = 'track_comment';
    }
}