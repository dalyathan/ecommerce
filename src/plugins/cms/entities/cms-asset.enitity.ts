import { DeepPartial, ID } from '@etech/common/lib/shared-types';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CmsEntity } from './cms.entity';
import {OrderableAsset} from "@etech/core/dist/entity/asset/orderable-asset.entity";

@Entity()
export class CmsAsset extends OrderableAsset {
    constructor(input?: DeepPartial<CmsAsset>) {
        super(input);
    }
    @Column({type:"varchar"})
    cmsEntityId: ID;

    @ManyToOne((type) => CmsEntity, (cmsEntity) => cmsEntity.assets, { onDelete: 'CASCADE' })
    cmsEntity: CmsEntity;
}
