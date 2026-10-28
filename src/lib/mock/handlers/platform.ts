import { http, HttpResponse } from 'msw/http';

export const platformHandlers = [
  http.get('*/v1/platform/config', () => {
    return HttpResponse.json({
      defaultCurrency: 'USD',
      defaultCurrencyExponent: 2,
      supportedCurrencies: ['USD'],
    });
  }),
];
