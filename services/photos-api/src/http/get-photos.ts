import log from '@common/utils/log';
import { wrap } from '@common/middleware/apigw';
import { getPhotosForEvent } from '@svc-models/event-photos';

export const handler = wrap(async (event) => {
  log.debug('received event', { event });
  const eventId = event.pathParameters!.eventId;

  log.debug('Get photos called', { event, eventId });
  const result = await getPhotosForEvent(eventId);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});
