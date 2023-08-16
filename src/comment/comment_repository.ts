import { QueryOrder, RequestContext } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";
import type { TrackEntity } from "../entities/TrackEntity";
import type { PictureData } from "../entities/BasePictureEntity";
import { TrackCommentEntity } from "../entities/TrackCommentEntity";
import type { PoolEntity } from "../entities/PoolEntity";
import { PoolCommentEntity } from "../entities/PoolCommentEntity";
import { BaseCommentEntity } from "../entities/BaseCommentEntity";

class CommentRepository {

    async create_track_comment(track: TrackEntity, 
                               text: string, 
                               pictures: PictureData[] = [])
        : Promise<TrackCommentEntity> {

        let comment = new TrackCommentEntity(text, track, pictures);
        await RequestContext.getEntityManager()!.persistAndFlush(comment);
        return comment;
    }

    async create_pool_comment(pool: PoolEntity, 
                              text: string, 
                              pictures: PictureData[] = [])
        : Promise<PoolCommentEntity> {

        let comment = new PoolCommentEntity(text, pool, pictures);
        await RequestContext.getEntityManager()!.persistAndFlush(comment);
        return comment;
    }

    async get_by_uuids(uuids: string[]): Promise<{[uuid:string]: BaseCommentEntity}> {

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
}

const comment_repository = new CommentRepository();
export default comment_repository;