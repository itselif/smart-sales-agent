const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { ReportRequest, ReportFile, ReportPolicy } = require("models");
const { Op } = require("sequelize");

const getReportRequestAggById = async (reportRequestId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const reportRequest = Array.isArray(reportRequestId)
      ? await ReportRequest.findAll({
          where: {
            id: { [Op.in]: reportRequestId },
            isActive: true,
          },
          include: includes,
        })
      : await ReportRequest.findOne({
          where: {
            id: reportRequestId,
            isActive: true,
          },
          include: includes,
        });

    if (!reportRequest) {
      return null;
    }

    const reportRequestData =
      Array.isArray(reportRequestId) && reportRequestId.length > 0
        ? reportRequest.map((item) => item.getData())
        : reportRequest.getData();
    await ReportRequest.getCqrsJoins(reportRequestData);
    return reportRequestData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportRequestAggById",
      err,
    );
  }
};

module.exports = getReportRequestAggById;
