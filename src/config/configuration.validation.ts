import * as Joi from 'joi';

export default () => {
  return Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'test', 'production')
      .default('development')
      .required(),
    PORT: Joi.number().required(),
    LOG_PATH: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
  });
};
