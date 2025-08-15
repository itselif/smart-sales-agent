const { HttpServerError } = require("common");

let { ReportPolicy } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getReportPolicyById = async (reportPolicyId) => {
  try {
    const reportPolicy = Array.isArray(reportPolicyId)
      ? await ReportPolicy.findAll({
          where: {
            id: { [Op.in]: reportPolicyId },
            isActive: true,
          },
        })
      : await ReportPolicy.findOne({
          where: {
            id: reportPolicyId,
            isActive: true,
          },
        });

    if (!reportPolicy) {
      return null;
    }
    return Array.isArray(reportPolicyId)
      ? reportPolicy.map((item) => item.getData())
      : reportPolicy.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportPolicyById",
      err,
    );
  }
};

module.exports = getReportPolicyById;
