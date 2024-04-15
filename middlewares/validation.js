const Joi = require("joi");

const urlParamsValidator = {
  params: Joi.object({
    chain_id: Joi.string().min(1).required().messages({ "any.invalid": "Invalid chain id " }),
    address: Joi.string().min(1).required().messages({ "any.invalid": "Invalid address " }),
  }),
};

const urlParamsWithTypeValidator = {
  params: Joi.object({
    chain_id: Joi.string().min(1).required().messages({ "any.invalid": "Invalid chain id " }),
    address: Joi.string().min(1).required().messages({ "any.invalid": "Invalid address " }),
    type: Joi.string()
      .min(1)
      .required()
      .valid("marketcap", "assets", "floorprice")
      .messages({ "any.invalid": "Invalid type " }),
  }),
};

module.exports = {
  urlParamsValidator,
  urlParamsWithTypeValidator,
};
