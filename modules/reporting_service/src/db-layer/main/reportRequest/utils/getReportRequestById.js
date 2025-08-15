const { HttpServerError } = require("common");

let { ReportRequest } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getReportRequestById = async (reportRequestId) => {
  try {
    const reportRequest = Array.isArray(reportRequestId)
      ? await ReportRequest.findAll({
          where: {
            id: { [Op.in]: reportRequestId },
            isActive: true,
          },
        })
      : await ReportRequest.findOne({
          where: {
            id: reportRequestId,
            isActive: true,
          },
        });

    if (!reportRequest) {
      return null;
    }
    return Array.isArray(reportRequestId)
      ? reportRequest.map((item) => item.getData())
      : reportRequest.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportRequestById",
      err,
    );
  }
};

module.exports = getReportRequestById;
