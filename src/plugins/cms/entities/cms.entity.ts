import {Column, Entity, ManyToOne, OneToMany, JoinTable,ManyToMany} from 'typeorm';
import {
    Channel,
    ChannelAware,
    DeepPartial,
    EntityWithAssets,
    EtechEntity,
    HasCustomFields,
    SoftDeletable,
    Translatable
} from "@etech/core";
import {Asset} from "@etech/core/dist/entity/asset/asset.entity";
import {LocaleString, Translation} from "@etech/core/dist/common/types/locale-types";
import {CmsAsset} from "./cms-asset.enitity";

@Entity()
export class CmsEntity extends EtechEntity implements Translatable, ChannelAware, SoftDeletable {
    constructor(input?: DeepPartial<CmsEntity>) {
        super(input);
    }

    translations: Translation<EtechEntity>[];

    @Column({unique:true})
    cmsType:String;

    @ManyToOne((type) => Asset, { onDelete: 'SET NULL' })
    featuredAsset: Asset;

    @OneToMany((type) => CmsAsset, (cmsAsset) => cmsAsset.cmsEntity)
    assets: CmsAsset[]

    @Column('simple-array')
    content:Blob[] | null;

    @ManyToMany((type) => Channel)
    @JoinTable()
    channels: Channel[];

    deletedAt: Date | null;
}
/*
* Type:                 Image:      Text:
* Popup                 [Asset]    "get something off"
* Return Policies       null        "get something off"
* About Us              null        "get something off"
* Contact Info          null        "get something off"
* Hero Section          Asset       "get something off"
* Advertisement         Asset       "get something off"
* Privacy Policies      null        "get something off"
* FAQ
* Testimonials
*
* */
