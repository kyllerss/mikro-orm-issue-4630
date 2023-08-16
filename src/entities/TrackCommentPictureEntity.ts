import { Entity, ManyToOne } from "@mikro-orm/core";
import { BasePictureEntity } from "./BasePictureEntity";
import { TrackCommentEntity } from "./TrackCommentEntity";

@Entity({discriminatorValue: 'track_comment'})
export class TrackCommentPictureEntity extends BasePictureEntity {

    @ManyToOne({fieldName: 'comment_uuid', 
               entity: () => TrackCommentEntity, 
               nullable: false, 
               eager: true})
    comment!: TrackCommentEntity;

    constructor() {

        super();
        this.type = 'track_comment';
    }
}