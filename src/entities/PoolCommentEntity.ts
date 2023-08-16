import { Collection, Entity, LoadStrategy, OneToMany } from "@mikro-orm/core";
import { BaseCommentEntity } from "./BaseCommentEntity";
import { PoolCommentPictureEntity } from "./PoolCommentPictureEntity";
import type { PictureData } from "./BasePictureEntity";

@Entity({discriminatorValue: 'pool'})
export class PoolCommentEntity extends BaseCommentEntity {

    @OneToMany({entity: () => PoolCommentPictureEntity, 
        mappedBy: 'comment', 
        orphanRemoval: true, 
        eager: true, 
        strategy: LoadStrategy.JOINED})
    pictures: Collection<PoolCommentPictureEntity>;

    constructor(pictures: PictureData[] = []) {

        super();
        this.type = 'pool';

        this.pictures = new Collection<PoolCommentPictureEntity>(this);

        for (let picture of pictures) {

            let picture_entity = new PoolCommentPictureEntity();
            this.pictures.add(picture_entity);
        }
    }
}