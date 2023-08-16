import { Collection, Entity, LoadStrategy, ManyToOne, OneToMany, Property, QueryOrder } from "@mikro-orm/core";
import { BaseCommentEntity } from "./BaseCommentEntity";
import { PoolEntity } from "./PoolEntity";
import { PoolCommentPictureEntity } from "./PoolCommentPictureEntity";
import type { PictureData } from "./BasePictureEntity";

@Entity({discriminatorValue: 'pool'})
export class PoolCommentEntity extends BaseCommentEntity {

    @ManyToOne({fieldName: 'pool_uuid', 
               entity: () => PoolEntity, 
               nullable: false, 
               eager: true})
    pool: PoolEntity;

    @OneToMany({entity: () => PoolCommentPictureEntity, 
        mappedBy: 'comment', 
        orphanRemoval: true, 
        eager: true, 
        strategy: LoadStrategy.JOINED, 
        orderBy: {'creation_timestamp': QueryOrder.ASC}})
    pictures: Collection<PoolCommentPictureEntity>;

    constructor(text: string, 
                pool: PoolEntity,
                pictures: PictureData[] = []) {

        super(text);
        this.pool = pool;
        this.type = 'pool';

        this.pictures = new Collection<PoolCommentPictureEntity>(this);

        for (let picture of pictures) {

            let picture_entity = 
                new PoolCommentPictureEntity(/*this,*/ 
                                            picture.size_type, 
                                            picture.width, 
                                            picture.height, 
                                            picture.path_name);
            this.pictures.add(picture_entity);
        }
    }
}