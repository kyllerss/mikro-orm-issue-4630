import { Collection, Entity, LoadStrategy, ManyToOne, OneToMany, OneToOne, OnInit, Property, QueryOrder } from "@mikro-orm/core";
import { BaseUUIDEntity } from "./BaseUUIDEntity";

@Entity({tableName: "pools"})
export class PoolEntity extends BaseUUIDEntity {

    @Property({type: 'datetime', nullable: true })
    start_timestamp!: Date;

    @Property({type: 'datetime', nullable: true })
    stop_timestamp!: Date;

    constructor(start_timestamp: Date, stop_timestamp: Date) {

        super();
        this.start_timestamp = start_timestamp;
        this.stop_timestamp = stop_timestamp;
    }
}