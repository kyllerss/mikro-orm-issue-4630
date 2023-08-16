import { MikroORM, RequestContext } from '@mikro-orm/core';
import {describe, expect, it} from 'vitest';
import { BaseUUIDEntity } from '../entities/BaseUUIDEntity';
import { BaseCommentEntity } from '../entities/BaseCommentEntity';
import { TrackCommentEntity } from '../entities/TrackCommentEntity';
import { PoolCommentEntity } from '../entities/PoolCommentEntity';
import { BasePictureEntity } from '../entities/BasePictureEntity';
import { TrackCommentPictureEntity } from '../entities/TrackCommentPictureEntity';
import { PoolCommentPictureEntity } from '../entities/PoolCommentPictureEntity';
import type { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql';

async function get_by_uuids(uuids: string[]): Promise<{[uuid:string]: BaseCommentEntity}> {

    if (uuids.length == 0) {
        return {};
    }

    const em: EntityManager = RequestContext.getEntityManager() as EntityManager;
    let results = await em.find(BaseCommentEntity, uuids, { populate: true });
    
    let to_return: {[uuid: string]: BaseCommentEntity} = {};
    for (let result of results) {
        to_return[result.uuid] = result;
        console.log("Loaded from database: ", result.type, result.uuid, result.pictures.length);
    }

    return to_return;
}

describe("Comment", async () => {

    const DB_URL = process.env.TEST_DATABASE_URL;

    if (!DB_URL) {
        console.error("Must define env variable TEST_DATABASE_URL in the form: 'postgres://<username>:<password>@<host>:<port>>/<database_name>?sslmode=disable'");
        throw new Error("TEST_DATABASE_URL is missing.");
    }
    
    const orm = await MikroORM.init<PostgreSqlDriver>({
        entities: [
            BaseUUIDEntity,
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
        discovery: { disableDynamicFileAccess: true }
    });
    
    it("performs create/read operations", async () => {

        let entity_manager = orm.em;

        let track_comment_1: TrackCommentEntity;
        let pool_comment_1: PoolCommentEntity;

        // create data
        await RequestContext.createAsync(entity_manager, async () => {

            let tc1_pictures = [{}, {}];

            track_comment_1 = new TrackCommentEntity(tc1_pictures);
            await RequestContext.getEntityManager()!.persistAndFlush(track_comment_1);

            let pc1_pictures = [{}, {}];
            
            pool_comment_1 = new PoolCommentEntity(pc1_pictures);
            await RequestContext.getEntityManager()!.persistAndFlush(pool_comment_1);
        });

        // load using abstract parent
        await RequestContext.createAsync(entity_manager, async () => {
            
            let comments = await get_by_uuids(
                [
                    track_comment_1.uuid,
                    pool_comment_1.uuid
                ]
            );

            let pc = comments[pool_comment_1.uuid];
            expect(pc.pictures).toBeDefined();
            expect(pc.pictures.length).toBe(2);

            let tc = comments[track_comment_1.uuid];
            expect(tc.pictures).toBeDefined();
            expect(tc.pictures.length).toBe(2);
        });
    });
});

