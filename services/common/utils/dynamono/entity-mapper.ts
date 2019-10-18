import DynamoDB, { DocumentClient, DeleteItemOutput } from 'aws-sdk/clients/dynamodb';
import _omit from 'lodash/omit';
import _pick from 'lodash/pick';
import _isEmpty from 'lodash/isEmpty';
import {
  ExpressionAttributes, ConditionExpression, UpdateExpression,
  serializeConditionExpression, attributeNotExists, equals,
} from '@aws/dynamodb-expressions';
import { QueryBuilder } from './query-builder';

export interface EntityIndexDefinition<T, K> {
  getPKField: (keyFields: K) => string;
  getSKField: (keyFields: K) => string;
  getComputedFields?: (entity: T) => {[keyField: string]:string};
}

export interface EntityPutOptions {
  overwriteExistingItem?: boolean;
  conditionExpression?: ConditionExpression;
  returnValues?: string;
}
const DEFAULT_PUT_OPTIONS: EntityPutOptions = { overwriteExistingItem: true };

export interface EntityUpdateOptions {
  ensureItemExists?: boolean;
  conditionExpression?: ConditionExpression;
  returnValues?: string;
}
const DEFAULT_UPDATE_OPTIONS: EntityUpdateOptions = { ensureItemExists: false };

export interface TimestampedEntity {
  dateCreated: string;
  dateUpdated: string;
}

export interface DynamoDBSingleTableConfig {
  tableName: string;
  documentClient: DocumentClient,
  isTestMode?: boolean;
}

export interface EntityMapperConfig<T, K> extends DynamoDBSingleTableConfig {
  indexDefinition: EntityIndexDefinition<T, K>;
  entityName: string;
  /**
   * Whitelist of fields of entity <T> that can be updated.
   * TODO: see if can enforce this type subset better with a Typescript util.
   */
  updateableFields?: string[];
}

export interface PrimaryKey {
  pk: string;
  sk: string;
}

export interface SingleTableItem extends PrimaryKey {
  entityName: string;
  dateCreated: string;
  dateUpdated: string;
  isTest?: string;
}

export class EntityMapper<T extends K & TimestampedEntity, K extends object> {
  private readonly nonEntityFields = [
    'pk',
    'sk',
    'entityName',
    'isTest',
  ];

  constructor(private readonly config: EntityMapperConfig<T, K>) {
    // TODO: validate config
  }

  getIndexDefinition(): EntityIndexDefinition<T, K> {
    return this.config.indexDefinition;
  }

  async get(key: K, requestOptions?: any): Promise<T | undefined> {
    const result = await this.config.documentClient.get({
      ...requestOptions,
      TableName: this.config.tableName,
      Key: this.mapPrimaryKeyFields(key),
    }).promise();
    return (result && result.Item)
      ? this.convertItemToEntity(result.Item) as T : undefined;
  }

  async batchGet(keys: K[]): Promise<T[]> {
    const result = await this.config.documentClient.batchGet({
      RequestItems: {
        [this.config.tableName]: {
          Keys: keys.map(k => this.mapPrimaryKeyFields(k)),
        },
      },
    }).promise();
    if (result.Responses && result.Responses[this.config.tableName]) {
      return result.Responses[this.config.tableName] as T[];
    }
    return [];
  }

  async put(
    entity: T, putOptions?: EntityPutOptions,
  ): Promise<DocumentClient.PutItemOutput | null> {
    const options = { ...DEFAULT_PUT_OPTIONS, ...putOptions };
    const atts = new ExpressionAttributes();
    const conditionExpression: ConditionExpression = {
      type: 'And', conditions: [],
    };
    if (options.overwriteExistingItem === false) {
      conditionExpression.conditions.push(...[
        { subject: 'pk', ...attributeNotExists() },
        { subject: 'sk', ...attributeNotExists() },
      ]);
    }
    if (options.conditionExpression) {
      conditionExpression.conditions.push(options.conditionExpression);
    }
    const serializedConditionExpression = conditionExpression.conditions.length
      ? serializeConditionExpression(conditionExpression, atts)
      : undefined;

    return this.config.documentClient.put({
      TableName: this.config.tableName,
      Item: this.convertEntityToItem(entity, new Date().toISOString()),
      ReturnValues: options.returnValues,
      ConditionExpression: serializedConditionExpression,
      ...getExpressionAttributeFields(atts),
    }).promise();
  }

  async update(
    key: K,
    updatedValues: any,
    updateOptions?: EntityUpdateOptions,
  ): Promise<DocumentClient.UpdateItemOutput> {
    const options = { ...DEFAULT_UPDATE_OPTIONS, ...updateOptions };
    const atts = new ExpressionAttributes();
    const conditionExpression: ConditionExpression = {
      type: 'And', conditions: [],
    };
    const updateExpression = this.getUpdateExpression(updatedValues);

    const primaryKey = this.mapPrimaryKeyFields(key);
    if (options.ensureItemExists) {
      conditionExpression.conditions.push(...[
        { subject: 'pk', ...equals(primaryKey.pk) },
        { subject: 'sk', ...equals(primaryKey.sk) },
      ]);
    }
    if (options.conditionExpression) {
      conditionExpression.conditions.push(options.conditionExpression);
    }
    const serializedConditionExpression = conditionExpression.conditions.length
      ? serializeConditionExpression(conditionExpression, atts)
      : undefined;
    return this.config.documentClient.update({
      TableName: this.config.tableName,
      Key: primaryKey,
      UpdateExpression: updateExpression.serialize(atts),
      ConditionExpression: serializedConditionExpression,
      ReturnValues: options.returnValues,
      ...getExpressionAttributeFields(atts),
    }).promise();
  }

  async query<T>(queryBuilder: QueryBuilder): Promise<T[]> {
    const query = queryBuilder.getQueryInput();
    const result = await this.config.documentClient.query(query).promise();
    return (result.Items) ? result.Items.map(i => this.convertItemToEntity<T>(i)) : [];
  }

  async delete(key: K, requestOptions?: any): Promise<DeleteItemOutput> {
    return this.config.documentClient.delete({
      ...requestOptions,
      TableName: this.config.tableName,
      Key: this.mapPrimaryKeyFields(key),
    }).promise();
  }

  private getUpdateExpression(updatedValues: any): UpdateExpression {
    const updateExpression = new UpdateExpression();
    // Whitelist input to only updateable fields
    const whitelistedValues = this.config.updateableFields
      ? _pick(updatedValues, this.config.updateableFields)
      : Object.keys(updatedValues);
    Object.keys(whitelistedValues).forEach((fieldName) => {
      updateExpression.set(fieldName, whitelistedValues[fieldName]);
    });
    return updateExpression;
  }

  private mapPrimaryKeyFields(key: K): PrimaryKey {
    return {
      pk: this.config.indexDefinition.getPKField(key),
      sk: this.config.indexDefinition.getSKField(key),
    };
  }

  convertEntityToItem(
    entity: T, dateUpdated: string,
  ): DocumentClient.PutItemInputAttributeMap {
    const item: SingleTableItem = {
      // Set core table index fields
      ...this.mapPrimaryKeyFields(entity),
      // Set other common metadata fields
      entityName: this.config.entityName,
      dateCreated: entity.dateCreated,
      dateUpdated,
      // Now  merge in entity specific field
      ...entity,
    };
    if (this.config.indexDefinition.getComputedFields) {
      // Optionally, set any other computed fields, e.g. for GSIs.
      Object.assign(item, this.config.indexDefinition.getComputedFields(entity));
    }
    return item;
  }

  convertItemToEntity<T>(item: any): T {
    return _omit(item, this.nonEntityFields) as T;
  }

  static getTimestampFields(timestamp?: string, existingEntity?: TimestampedEntity): TimestampedEntity {
    const dt = timestamp || new Date().toISOString();
    return {
      dateCreated: (existingEntity && existingEntity.dateCreated) ? existingEntity.dateCreated : dt,
      dateUpdated: dt,
    };
  }
}

function getExpressionAttributeFields(atts: ExpressionAttributes): any {
  const vals = atts.marshaller.unmarshallItem(atts.values);
  return {
    ExpressionAttributeNames: !_isEmpty(atts.names) ? atts.names : undefined,
    ExpressionAttributeValues: !_isEmpty(vals) ? vals : undefined,
  };
}
