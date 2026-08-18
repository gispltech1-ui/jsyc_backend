export const PAYU = {
  key: process.env.PAYU_MERCHANT_KEY!,
  salt: process.env.PAYU_MERCHANT_SALT!,
  baseUrl: process.env.PAYU_BASE_URL!,
  successUrl: process.env.PAYU_SUCCESS_URL!,
  failureUrl: process.env.PAYU_FAILURE_URL!,
};