import { Collection, Entity, LoadStrategy, ManyToOne, OneToMany, Property, QueryOrder } from "@mikro-orm/core";
import { BaseCommentEntity } from "./BaseCommentEntity";
import { TrackEntity } from "./TrackEntity";
import { TrackCommentPictureEntity } from "./TrackCommentPictureEntity";
import type { PictureData } from "./BasePictureEntity";

@Entity({discriminatorValue: 'track'})
export class TrackCommentEntity extends BaseCommentEntity {

    @ManyToOne({fieldName: 'track_uuid', 
               entity: () => TrackEntity, 
               nullable: false, 
               eager: true})
    track: TrackEntity;

    @OneToMany({entity: () => TrackCommentPictureEntity, 
        mappedBy: 'comment', 
        orphanRemoval: true, 
        eager: true, 
        strategy: LoadStrategy.JOINED, 
        orderBy: {'creation_timestamp': QueryOrder.ASC}})
    pictures: Collection<TrackCommentPictureEntity>;

    constructor(text: string, 
                track: TrackEntity,
                pictures: PictureData[] = []) {
                    
        super(text);
        this.track = track;
        this.type = 'track';

        this.pictures = new Collection<TrackCommentPictureEntity>(this);

        for (let picture of pictures) {

            let picture_entity = 
                new TrackCommentPictureEntity(/*this,*/ 
                                            picture.size_type, 
                                            picture.width, 
                                            picture.height, 
                                            picture.path_name);
            this.pictures.add(picture_entity);
        }
    }
}