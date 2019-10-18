import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import {
  ExpressionAttributes, ConditionExpression, equals, beginsWith,
  serializeConditionExpression,
  AndExpression,
  between,
} from '@aws/dynamodb-expressions';

export interface QueryBuilderConfig {
  partitionKey: { fieldName: string, value: string };
  sortKeyField: string;
  tableName: string;
  indexName?: string;
  queryInputOptions?: any;
}

/**
 * Helper class for building queries against single table DynamoDB.
 */
export class QueryBuilder {
  private readonly atts: ExpressionAttributes = new ExpressionAttributes();

  private readonly keyConditions: AndExpression = {
    type: 'And',
    conditions: [],
  };

  private readonly projectionFields: string[] = [];

  private filterExpression: ConditionExpression | undefined;

  constructor(
    private readonly config: QueryBuilderConfig,
  ) {
    // Add partitionKey to conditions
    this.keyConditions.conditions.push({
      subject: this.config.partitionKey.fieldName, ...equals(this.config.partitionKey.value),
    });
  }

  addSortKeyConditionEquals(value: any): void {
    this.keyConditions.conditions.push({
      subject: this.config.sortKeyField, ...equals(value),
    });
  }

  addSortKeyConditionHasPrefix(prefix: string): void {
    this.keyConditions.conditions.push({
      subject: this.config.sortKeyField, ...beginsWith(prefix),
    });
  }

  addSortKeyBetween(from: any, to: any, prefix: string = ''): void {
    this.keyConditions.conditions.push({
      subject: this.config.sortKeyField,
      ...between(`${prefix}${from}`, `${prefix}${to}`),
    });
  }

  addKeyCondition(condition: ConditionExpression): void {
    this.keyConditions.conditions.push(condition);
  }

  addProjectionField(field: string): void {
    this.projectionFields.push(this.atts.addName(field));
  }

  addProjectionFields(fields: string[]): void {
    fields.forEach((f) => {
      this.projectionFields.push(this.atts.addName(f));
    });
  }

  setFilterExpression(expr: ConditionExpression): void {
    this.filterExpression = expr;
  }

  getQueryInput(): DocumentClient.QueryInput {
    const query: DocumentClient.QueryInput = {
      ...this.config.queryInputOptions,
      TableName: this.config.tableName,
      IndexName: this.config.indexName,
      KeyConditionExpression: serializeConditionExpression(this.keyConditions, this.atts),
      FilterExpression: this.filterExpression
        ? serializeConditionExpression(this.filterExpression, this.atts) : undefined,
      ProjectionExpression: this.projectionFields.length ? this.projectionFields.join(',') : undefined,
      ExpressionAttributeNames: this.atts.names,
      ExpressionAttributeValues: this.atts.marshaller.unmarshallItem(this.atts.values),
    };
    return query;
  }
}
