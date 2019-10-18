import { EventPhoto, EventPhotoKeyFields, EventPhotoCreate } from '@common/schemas/photos-api';
import log from '@common/utils/log';
import { StatusCodeError } from '@common/utils/errors';
import uuid from 'uuid/v4';
import { EntityMapper, DynamoDBSingleTableConfig, EntityMapperConfig } from '@common/utils/dynamono/entity-mapper';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ddb, aws } from '@svc-config';
import { QueryBuilder } from '@common/utils/dynamono/query-builder';

const dynamonoConfig: EntityMapperConfig<EventPhoto, EventPhotoKeyFields> = {
    tableName: ddb.MainTable,
    documentClient: new DocumentClient({ region: aws.region }),
    entityName: 'EventPhoto',
    indexDefinition: {
        getPKField: keyFields => `EVENT#${keyFields.eventId}`,
        getSKField: keyFields => `PHOTO#${keyFields.id}`,
    },
};

const photoMapper = new EntityMapper(dynamonoConfig);

export const savePhoto = async (newPhoto: EventPhotoCreate): Promise<EventPhoto> => {
    if (!newPhoto.eventId) {
        throw new StatusCodeError(400, '"eventId" must be set');
    }
    const photo: EventPhoto = {
        ...newPhoto,
        id: newPhoto.id || uuid(),
        ...EntityMapper.getTimestampFields(),
    };
    log.debug('Saving photo ...', { photo });
    try {
        const result = await photoMapper.put(photo);
        log.info('Created new photo', { photo, result });
        return photo;
    } catch (error) {
        log.error('Error creating new photo.', { newPhoto }, error);
        throw error;
    }
};

export const getPhotosForEvent = async (eventId: string): Promise<EventPhoto[]> => {
    const query = new QueryBuilder({
        ...dynamonoConfig,
        partitionKey: { fieldName: 'pk', value: `EVENT#${eventId}` },
        sortKeyField: 'sk',
        queryInputOptions: { ScanIndexForward: false },
    });
    return photoMapper.query<EventPhoto>(query);
};

