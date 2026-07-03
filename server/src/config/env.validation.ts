import * as Joi from 'joi'

// Validação do ambiente — falha rápido se algo essencial faltar.
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3333),
  DATABASE_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL_DAYS: Joi.number().default(7),
  CORS_ORIGIN: Joi.string().default('*'),
  // EVA Hub (coach de IA) — OPCIONAIS: sem elas o /api/eva/chat responde 501 e o
  // Coach usa a prévia rule-based. A chave fica SÓ no servidor, nunca no bundle.
  EVA_HUB_KEY: Joi.string().allow('').optional(),
  EVA_ASSISTANT_ID: Joi.string().allow('').optional(),
  EVA_HUB_URL: Joi.string().uri().default('https://evahub.com.br/api/v1/chat'),
  // Billing (Stripe) — OPCIONAIS: sem chaves o /api/billing/checkout responde 501
  // e o app segue no plano free. Price IDs criados no dashboard do Stripe.
  STRIPE_SECRET_KEY: Joi.string().allow('').optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow('').optional(),
  STRIPE_PRICE_PRO_MONTHLY: Joi.string().allow('').optional(),
  STRIPE_PRICE_PRO_YEARLY: Joi.string().allow('').optional(),
  STRIPE_PRICE_IGREJA_MONTHLY: Joi.string().allow('').optional(),
  STRIPE_PRICE_IGREJA_YEARLY: Joi.string().allow('').optional(),
  STRIPE_PRICE_PROFESSOR_MONTHLY: Joi.string().allow('').optional(),
  STRIPE_PRICE_PROFESSOR_YEARLY: Joi.string().allow('').optional(),
  APP_URL: Joi.string().uri().default('http://localhost:5173'),
})
