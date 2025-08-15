const catchAsync = require("common/catchAsync");
const validate = require("middlewares/validate");
const httpStatus = require("http-status");
const filterSchema = require("validations/index");

const express = require("express");
const { dynamicService } = require("services");
const router = express.Router();

router
  .route("/list")
  .post(
    validate(filterSchema.filterValidation),
    catchAsync(async (req, res) => {
      const { query } = req;
      const { page, limit, sortBy, sortOrder, q } = query;
      const response = await dynamicService.handleListElasticIndex(
        "salesdashboardview",
        page,
        limit,
        q,
        {
          by: sortBy,
          order: sortOrder,
        },
        req.body,
        [],
      );
      return res.status(httpStatus.OK).json(response);
    }),
  )
  .get(
    validate(filterSchema.listValidation),
    catchAsync(async (req, res) => {
      const { query } = req;
      const { page, limit, sortBy, sortOrder, q } = query;
      const response = await dynamicService.handleListElasticIndex(
        "salesdashboardview",
        page,
        limit,
        q,
        {
          by: sortBy,
          order: sortOrder,
        },
        {},
        [],
      );
      return res.status(httpStatus.OK).json(response);
    }),
  );

router
  .route("/count")
  .post(
    validate(filterSchema.filterValidation),
    catchAsync(async (req, res) => {
      const response = await dynamicService.handleCountElasticIndex(
        "salesdashboardview",
        req.query.q,
        req.body,
      );
      return res.status(httpStatus.OK).json(response);
    }),
  )
  .get(
    validate(filterSchema.listValidation),
    catchAsync(async (req, res) => {
      const response = await dynamicService.handleCountElasticIndex(
        "salesdashboardview",
        req.query.q,
        {},
      );
      return res.status(httpStatus.OK).json(response);
    }),
  );

router.route("/schema").get(
  catchAsync(async (req, res) => {
    const response =
      await dynamicService.handleElasticIndexSchema("salesdashboardview");
    return res.status(httpStatus.OK).json(response);
  }),
);

router
  .route("/filters")
  .get(
    validate(filterSchema.getFilterValidation),
    catchAsync(async (req, res) => {
      const { query } = req;
      const { page, limit } = query;
      const response = await dynamicService.handleGetFiltersElasticIndex(
        "salesdashboardview",
        "session.userId",
        page,
        limit,
      );
      return res.status(httpStatus.OK).json(response);
    }),
  )
  .post(
    catchAsync(async (req, res) => {
      const response = await dynamicService.handleSaveFiltersElasticIndex(
        "salesdashboardview",
        "session.userId",
        req.body,
      );
      return res.status(httpStatus.OK).json(response);
    }),
  );

router.route("/filters/:filterId").delete(
  validate(filterSchema.deleteFilterValidation),
  catchAsync(async (req, res) => {
    await dynamicService.handleDeleteFiltersElasticIndex(
      "salesdashboardview",
      "session.userId",
      req.params.filterId,
    );
    return res.status(httpStatus.OK).json({ message: "Filter deleted" });
  }),
);

router.route("/:id").get(
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const response = await dynamicService.handleGetElasticIndex(
      "salesdashboardview",
      id,
    );
    return res.status(httpStatus.OK).json(response);
  }),
);

module.exports = router;
