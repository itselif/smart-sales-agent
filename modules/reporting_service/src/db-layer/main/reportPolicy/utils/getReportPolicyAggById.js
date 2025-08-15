const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { ReportRequest, ReportFile, ReportPolicy } = require("models");
const { Op } = require("sequelize");

const getReportPolicyAggById = async (reportPolicyId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const reportPolicy = Array.isArray(reportPolicyId)
      ? await ReportPolicy.findAll({
          where: {
            id: { [Op.in]: reportPolicyId },
            isActive: true,
          },
          include: includes,
        })
      : await ReportPolicy.findOne({
          where: {
            id: reportPolicyId,
            isActive: true,
          },
          include: includes,
        });

    if (!reportPolicy) {
      return null;
    }

    const reportPolicyData =
      Array.isArray(reportPolicyId) && reportPolicyId.length > 0
        ? reportPolicy.map((item) => item.getData())
        : reportPolicy.getData();
    await ReportPolicy.getCqrsJoins(reportPolicyData);
    return reportPolicyData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportPolicyAggById",
      err,
    );
  }
};

module.exports = getReportPolicyAggById;
