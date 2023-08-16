import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import { SqliteDriver } from '@mikro-orm/sqlite';
import crypto from 'crypto';
import { MikroORM, Entity, Enum, PrimaryKey, ManyToOne, Collection, LoadStrategy, OneToMany } from "@mikro-orm/core";

@Entity({
    tableName: 'comments',
    discriminatorColumn: 'type',
    abstract: true,
  })
abstract class BaseCommentEntity {

    @PrimaryKey({ type: 'uuid' })
    uuid: string = crypto.randomUUID();

    @Enum({type: 'varchar', nullable: false})
    type!: 'track' | 'pool'; 

    abstract pictures: any;
}

@Entity({
    tableName: 'pictures',
    discriminatorColumn: 'type',
    abstract: true,
  })
abstract class BasePictureEntity {

    @PrimaryKey({ type: 'uuid' })
    uuid: string = crypto.randomUUID();

    @Enum({type: 'varchar', nullable: false})
    type!: 'track_comment' | 'pool_comment'; 
}

@Entity({discriminatorValue: 'pool'})
class PoolCommentEntity extends BaseCommentEntity {

    @OneToMany({entity: () => PoolCommentPictureEntity, 
        mappedBy: 'comment', 
        orphanRemoval: true, 
        eager: true, 
        strategy: LoadStrategy.JOINED})
    pictures: Collection<PoolCommentPictureEntity>;

    constructor(pictures: any[] = []) {

        super();
        this.type = 'pool';

        this.pictures = new Collection<PoolCommentPictureEntity>(this);

        for (let picture of pictures) {

            let picture_entity = new PoolCommentPictureEntity();
            this.pictures.add(picture_entity);
        }
    }
}

@Entity({discriminatorValue: 'pool_comment'})
class PoolCommentPictureEntity extends BasePictureEntity {

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

@Entity({discriminatorValue: 'track'})
class TrackCommentEntity extends BaseCommentEntity {

    @OneToMany({entity: () => TrackCommentPictureEntity, 
        mappedBy: 'comment', 
        orphanRemoval: true, 
        eager: true, 
        strategy: LoadStrategy.JOINED})
    pictures: Collection<TrackCommentPictureEntity>;

    constructor(pictures: any[] = []) {
                    
        super();
        this.type = 'track';

        this.pictures = new Collection<TrackCommentPictureEntity>(this);

        for (let picture of pictures) {

            let picture_entity = new TrackCommentPictureEntity();
            this.pictures.add(picture_entity);
        }
    }
}

@Entity({discriminatorValue: 'track_comment'})
class TrackCommentPictureEntity extends BasePictureEntity {

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

describe("Issue 4630", async () => {

    let orm: MikroORM<SqliteDriver>;

    beforeAll(async () => {

        orm = await MikroORM.init({
            entities: [
                BaseCommentEntity, TrackCommentEntity, PoolCommentEntity,
                BasePictureEntity, TrackCommentPictureEntity, PoolCommentPictureEntity
            ],
            dbName: ':memory:',
            driver: SqliteDriver,
            allowGlobalContext: true
        });
        await orm.schema.createSchema();
    });
    
    afterAll(() => orm.close(true)); 

    it("should load pool and track comment pictures", async () => {

        let entity_manager = orm.em;

        // create data
        let tc1_pictures = [{}, {}];

        let track_comment_1: TrackCommentEntity = new TrackCommentEntity(tc1_pictures);
        await entity_manager.persistAndFlush(track_comment_1);

        let pc1_pictures = [{}, {}];
        
        let pool_comment_1: PoolCommentEntity = new PoolCommentEntity(pc1_pictures);
        await entity_manager.persistAndFlush(pool_comment_1);

        entity_manager.clear(); // force reading from DB

        // load using abstract parent            
        let uuids = [ track_comment_1.uuid, pool_comment_1.uuid ];
        let results = await entity_manager.find(BaseCommentEntity, uuids, { populate: true });
        
        let comments: {[uuid: string]: BaseCommentEntity} = {};
        for (let result of results) {
            comments[result.uuid] = result;
            console.log("Loaded from database: ", result.type, result.uuid, result.pictures.length);
        }

        let pc = comments[pool_comment_1.uuid];
        expect(pc.pictures).toBeDefined();
        expect(pc.pictures.length).toBe(2);

        let tc = comments[track_comment_1.uuid];
        expect(tc.pictures).toBeDefined();
        expect(tc.pictures.length).toBe(2);
    });
});

