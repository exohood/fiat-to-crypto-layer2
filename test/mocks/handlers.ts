import { rest } from 'msw';
import { ROUTER_API } from '../../src';
import { quoteResponse, routeResponse } from './responses';

export const handlers = [
  // HAPPY PATHS
  rest.get(`${ROUTER_API}/quote`, (req, res, ctx) => {
    const slippageTolerance = req.url.searchParams.get('slippageTolerance');
    const deadline = req.url.searchParams.get('deadline');
    const recipient = req.url.searchParams.get('recipient');

    if (Number(slippageTolerance) > 0 && Number(deadline) > 0 && recipient) {
      return res(ctx.status(200), ctx.json(routeResponse));
      // api will still return 200, but the response will not include methodParams, ie. just a quote
    } else {
      return res(ctx.status(200), ctx.json(quoteResponse));
    }
  }),

  // SAD PATHS - (dummy urls, to test handling of known quote API errors)
  rest.get('api400', (req, res, ctx) => {
    const invalidAddress = req.url.searchParams.get('invalidAddress');
    return res(
      ctx.status(400),
      ctx.json({
        statusCode: 400,
        errorCode: 'TOKEN_IN_INVALID',
        detail: `Could not find token with address "${invalidAddress}"`,
      })
    );
  }),

  rest.get(`api422`, (_, res, ctx) => {
    return res(
      ctx.status(422),
      ctx.json({
        statusCode: 422,
        errorCode: 'VALIDATION_ERROR',
        detail: 'Invalid JSON body',
      })
    );
  }),

  rest.get('api500', (_, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        errorCode: 'INTERNAL_ERROR',
        detail: 'Unexpected error',
      })
    );
  }),

  rest.get('api300', (_, res, ctx) => {
    return res(
      ctx.status(300),
      ctx.json({
        statusCode: 300,
        errorCode: 'UNRECOGNIZED_ERROR',
        detail: 'This is not something our api should be returning',
      })
    );
  }),
];
