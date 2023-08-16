import { MikroORM, RequestContext } from '@mikro-orm/core';
import {describe, expect, it, vi, afterEach, beforeEach} from 'vitest';
import crypto from 'crypto';
import { BaseUUIDEntity } from '../entities/BaseUUIDEntity';
import { TrackEntity } from '../entities/TrackEntity';
import { PoolEntity } from '../entities/PoolEntity';
import { BaseCommentEntity } from '../entities/BaseCommentEntity';
import { TrackCommentEntity } from '../entities/TrackCommentEntity';
import { PoolCommentEntity } from '../entities/PoolCommentEntity';
import { BasePictureEntity, type PictureData } from '../entities/BasePictureEntity';
import { TrackCommentPictureEntity } from '../entities/TrackCommentPictureEntity';
import { PoolCommentPictureEntity } from '../entities/PoolCommentPictureEntity';
import type { PostgreSqlDriver } from '@mikro-orm/postgresql';
import comment_repository from '../comment/comment_repository';

describe("Comment", async () => {

    const DB_URL = process.env.TEST_DATABASE_URL; //`postgres://dev_root:my-swimified-db-dev-password@db.dev.swimified.com:5432/swimified_test?sslmode=disable`;

    if (!DB_URL) {
        console.error("Must define env variable TEST_DATABASE_URL in the form: 'postgres://<username>:<password>@<host>:<port>>/<database_name>?sslmode=disable'");
        throw new Error("TEST_DATABASE_URL is missing.");
    }
    
    const orm = await MikroORM.init<PostgreSqlDriver>({
        entities: [
            BaseUUIDEntity, TrackEntity, PoolEntity,
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

        let track: TrackEntity;
        let track_comment_1: TrackCommentEntity;
        let track_comment_2: TrackCommentEntity;

        let pool: PoolEntity;
        let pool_comment_1: PoolCommentEntity;
        let pool_comment_2: PoolCommentEntity;

        let tc1_p1_full: PictureData;
        let tc1_p1_thumbnail: PictureData;
        let tc1_p2_full: PictureData;
        let tc1_p2_thumbnail: PictureData;

        let pc1_p1_full: PictureData;
        let pc1_p1_thumbnail: PictureData;
        let pc1_p2_full: PictureData;
        let pc1_p2_thumbnail: PictureData;

        let track_comments: TrackCommentEntity[];
        let pool_comments: PoolCommentEntity[];

        // create data
        await RequestContext.createAsync(entity_manager, async () => {

            track = new TrackEntity(new Date(1000), new Date(2000));
            pool = new PoolEntity(new Date(3000), new Date(4000));

            tc1_p1_full = {height: 17, width: 18, path_name: "path_9", size_type: 'full'};
            tc1_p1_thumbnail = {height: 19, width: 20, path_name: "path_10", size_type: 'thumbnail'};
            tc1_p2_full = {height: 21, width: 22, path_name: "path_11", size_type: 'full'};
            tc1_p2_thumbnail = {height: 23, width: 24, path_name: "path_12", size_type: 'thumbnail'};
            let tc1_pictures = [tc1_p1_full, tc1_p1_thumbnail, tc1_p2_full, tc1_p2_thumbnail];

            track_comment_1 = await comment_repository.create_track_comment(track, crypto.randomUUID(), tc1_pictures);

            pc1_p1_full = {height: 25, width: 26, path_name: "path_13", size_type: 'full'};
            pc1_p1_thumbnail = {height: 27, width: 28, path_name: "path_14", size_type: 'thumbnail'};
            pc1_p2_full = {height: 29, width: 30, path_name: "path_15", size_type: 'full'};
            pc1_p2_thumbnail = {height: 31, width: 32, path_name: "path_16", size_type: 'thumbnail'};
            let pc1_pictures = [pc1_p1_full, pc1_p1_thumbnail, pc1_p2_full, pc1_p2_thumbnail];
            
            pool_comment_1 = await comment_repository.create_pool_comment(pool, crypto.randomUUID(), pc1_pictures);
        });

        // // validate db state
        // await RequestContext.createAsync(entity_manager, async () => {

        //     track_comments = await comment_service.list_track_comments(track.uuid);
        //     expect(track_comments).toBeDefined();
        //     expect(track_comments.length).toBe(1);
        //     validate_picture(tc1_p1_full, track_comments[0]?.pictures.getItems() ?? []);
        //     validate_picture(tc1_p1_thumbnail, track_comments[0]?.pictures.getItems() ?? []);
        //     validate_picture(tc1_p2_full, track_comments[0]?.pictures.getItems() ?? []);
        //     validate_picture(tc1_p2_thumbnail, track_comments[0]?.pictures.getItems() ?? []);

        //     pool_comments = await comment_service.list_pool_comments(pool.uuid);
        //     expect(pool_comments).toBeDefined();
        //     expect(pool_comments.length).toBe(1);
        //     validate_picture(pc1_p1_full, pool_comments[0]?.pictures.getItems() ?? []);
        //     validate_picture(pc1_p1_thumbnail, pool_comments[0]?.pictures.getItems() ?? []);
        //     validate_picture(pc1_p2_full, pool_comments[0]?.pictures.getItems() ?? []);
        //     validate_picture(pc1_p2_thumbnail, pool_comments[0]?.pictures.getItems() ?? []);            
        // });

        // load using abstract parent
        await RequestContext.createAsync(entity_manager, async () => {
            
            let comments = await comment_repository.get_by_uuids(
                [
                    track_comment_1.uuid,
                    pool_comment_1.uuid
                ]
            );

            let tc = comments[track_comment_1.uuid];
            expect(tc.pictures).toBeDefined();
            expect(tc.pictures.length).toBe(4);

            let pc = comments[pool_comment_1.uuid];
            expect(pc.pictures).toBeDefined();
            expect(pc.pictures.length).toBe(4);
        });
    });
});

// function validate_picture(exp_picture: PictureData, pictures: BasePictureEntity[]) {

//     let picture = pictures.find(item => item.path_name === exp_picture.path_name);
//     expect(picture).toBeDefined();
//     expect(picture?.size_type).toBe(exp_picture.size_type);
//     expect(picture?.width).toBe(exp_picture.width);
//     expect(picture?.height).toBe(exp_picture.height);
// }

