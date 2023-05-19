import { LanguageCode } from '@etech/common/lib/generated-types';
import { DeepPartial } from '@etech/common/lib/shared-types';
import { Column, Entity, ManyToOne } from 'typeorm';

import {CmsEntity} from "./cms.entity";
import {CustomCollectionFieldsTranslation, EtechEntity,  Translation} from "@etech/core";
import {LocaleString} from "@etech/core/dist/common/types/locale-types";

@Entity()
export class CmsTranslation extends EtechEntity implements Translation<CmsEntity> {
    constructor(input?: DeepPartial<Translation<CmsEntity>>) {
        super(input);
    }

    @Column('varchar') languageCode: LanguageCode;

    @Column() content: LocaleString[];

    @ManyToOne(
        type => CmsEntity,
        base => base.translations,
        { onDelete: 'CASCADE' },
    )
    base: CmsEntity;

}
