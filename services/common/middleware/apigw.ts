import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { StatusCodeError } from '@common/utils/errors';
import log from '@common/utils/log';

export type APIGatewayHandler =
    (event: APIGatewayProxyEvent, context?: Context) => Promise<APIGatewayProxyResult>;

function addCorsHeaders(response: APIGatewayProxyResult): APIGatewayProxyResult {
    return {
        ...response,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    };
}

/** Wraps all API Lambda handlers with common middleware */
export function wrap(handler: APIGatewayHandler): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> {
    return async (
        event: APIGatewayProxyEvent, context?: Context,
    ): Promise<APIGatewayProxyResult> => {
        try {
            // make user context available to each request
            const result = await handler(event, context);
            return addCorsHeaders(result);
        } catch (e) {
            if (e instanceof StatusCodeError) {
                log.warn('StatusCodeError', { event, context }, e);
                return addCorsHeaders({
                    statusCode: e.statusCode,
                    body: JSON.stringify({
                        error: e.message,
                    }),
                });
            }
            log.error('Unhandled error', { event, context }, e);
            return addCorsHeaders({
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Server error',
                }),
            });
        }
    };
}
