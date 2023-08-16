import { Collection, Entity, LoadStrategy, OneToMany } from "@mikro-orm/core";
import { BaseCommentEntity } from "./BaseCommentEntity";
import { TrackCommentPictureEntity } from "./TrackCommentPictureEntity";
import type { PictureData } from "./BasePictureEntity";

@Entity({discriminatorValue: 'track'})
export class TrackCommentEntity extends BaseCommentEntity {

    @OneToMany({entity: () => TrackCommentPictureEntity, 
        mappedBy: 'comment', 
        orphanRemoval: true, 
        eager: true, 
        strategy: LoadStrategy.JOINED})
    pictures: Collection<TrackCommentPictureEntity>;

    constructor(pictures: PictureData[] = []) {
                    
        super();
        this.type = 'track';

        this.pictures = new Collection<TrackCommentPictureEntity>(this);

        for (let picture of pictures) {

            let picture_entity = new TrackCommentPictureEntity();
            this.pictures.add(picture_entity);
        }
    }
}