import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { MikroORM, Entity, Enum, PrimaryKey, ManyToOne, Collection, LoadStrategy, OneToMany } from "@mikro-orm/core";

@Entity({
    tableName: 'comments',
    discriminatorColumn: 'type',
    abstract: true,
  })
abstract class BaseCommentEntity {

    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    uuid!: string;

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

    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    uuid!: string;

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

    const DB_URL = process.env.TEST_DATABASE_URL;

    if (!DB_URL) {
        console.error("Must define env variable TEST_DATABASE_URL in the form: 'postgres://<username>:<password>@<host>:<port>>/<database_name>?sslmode=disable'");
        throw new Error("TEST_DATABASE_URL is missing.");
    }
    
    let orm: MikroORM<PostgreSqlDriver>;

    beforeAll(async () => {
        orm = await MikroORM.init<PostgreSqlDriver>({
            entities: [
                BaseCommentEntity, TrackCommentEntity, PoolCommentEntity,
                BasePictureEntity, TrackCommentPictureEntity, PoolCommentPictureEntity
            ],
            type: "postgresql",
            clientUrl: DB_URL,
            forceUndefined: true,
            debug: true,
            pool: {min: 2, max: 5}, 
            driverOptions: {
                connection: {
                    ssl: false
                }
            },
            discovery: { disableDynamicFileAccess: true },
            allowGlobalContext: true
        });
    });
    
    afterAll(() => orm.close(true)); 

    it("doesn't load track comment pictures", async () => {

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

