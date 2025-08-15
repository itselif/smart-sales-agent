const Joi = require("joi");

const filterValidation = {
  body: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      operator: Joi.string()
        .valid(
          "match",
          "eq",
          "noteq",
          "range",
          "exists",
          "missing",
          "prefix",
          "wildcard",
          "regexp",
          "match_phrase",
          "match_phrase_prefix",
        )
        .required(),
      value: Joi.alternatives().conditional("operator", {
        is: Joi.string().valid(
          "match",
          "eq",
          "noteq",
          "prefix",
          "wildcard",
          "regexp",
          "match_phrase",
          "match_phrase_prefix",
        ),
        then: Joi.string().required(),
        otherwise: Joi.alternatives().try(
          Joi.string(),
          Joi.number(),
          Joi.date(),
        ),
      }),
      values: Joi.alternatives().conditional("operator", {
        is: "range",
        then: Joi.array()
          .items(Joi.number().required())
          .min(2)
          .max(2)
          .required(),
        otherwise: Joi.any().forbidden(),
      }),
    }),
  ),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid("asc", "desc"),
    q: Joi.string(),
  }),
};

const listValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid("asc", "desc"),
    q: Joi.string(),
  }),
};

const getFilterValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};

const deleteFilterValidation = {
  params: Joi.object({
    filterId: Joi.string().required(),
  }),
};

module.exports = {
  filterValidation,
  listValidation,
  getFilterValidation,
  deleteFilterValidation,
};
