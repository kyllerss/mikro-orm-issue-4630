import { Entity, PrimaryKey } from "@mikro-orm/core";

@Entity({abstract: true})
export abstract class BaseUUIDEntity {

    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    uuid!: string;
}