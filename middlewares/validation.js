const Joi = require("joi");
const { allowedMetricNames } = require("../contants");

const urlParamsValidator = {
  params: Joi.object({
    chain_id: Joi.string().min(1).required().messages({ "any.invalid": "Invalid chain id " }),
    address: Joi.string().min(1).required().messages({ "any.invalid": "Invalid address " }),
  }),
};

const urlParamsWithMetricNameValidator = {
  params: Joi.object({
    chain_id: Joi.string().min(1).required().messages({ "any.invalid": "Invalid chain id " }),
    address: Joi.string().min(1).required().messages({ "any.invalid": "Invalid address " }),
    metric_name: Joi.string()
      .min(1)
      .required()
      .valid(...allowedMetricNames)
      .messages({ "any.invalid": "Invalid metric_name" }),
  }),
};

module.exports = {
  urlParamsValidator,
  urlParamsWithMetricNameValidator,
};
