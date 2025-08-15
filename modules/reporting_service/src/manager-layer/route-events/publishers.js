const { ServicePublisher } = require("serviceCommon");

// ReportRequest Event Publisher Classes

// Publisher class for createReportRequest route
const { ReportrequestCreatedTopic } = require("./topics");
class ReportrequestCreatedPublisher extends ServicePublisher {
  constructor(reportrequest, session, requestId) {
    super(ReportrequestCreatedTopic, reportrequest, session, requestId);
  }

  static async Publish(reportrequest, session, requestId) {
    const _publisher = new ReportrequestCreatedPublisher(
      reportrequest,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateReportRequest route
const { ReportrequestUpdatedTopic } = require("./topics");
class ReportrequestUpdatedPublisher extends ServicePublisher {
  constructor(reportrequest, session, requestId) {
    super(ReportrequestUpdatedTopic, reportrequest, session, requestId);
  }

  static async Publish(reportrequest, session, requestId) {
    const _publisher = new ReportrequestUpdatedPublisher(
      reportrequest,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteReportRequest route
const { ReportrequestDeletedTopic } = require("./topics");
class ReportrequestDeletedPublisher extends ServicePublisher {
  constructor(reportrequest, session, requestId) {
    super(ReportrequestDeletedTopic, reportrequest, session, requestId);
  }

  static async Publish(reportrequest, session, requestId) {
    const _publisher = new ReportrequestDeletedPublisher(
      reportrequest,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// ReportFile Event Publisher Classes

// Publisher class for createReportFile route
const { ReportfileCreatedTopic } = require("./topics");
class ReportfileCreatedPublisher extends ServicePublisher {
  constructor(reportfile, session, requestId) {
    super(ReportfileCreatedTopic, reportfile, session, requestId);
  }

  static async Publish(reportfile, session, requestId) {
    const _publisher = new ReportfileCreatedPublisher(
      reportfile,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateReportFile route
const { ReportfileUpdatedTopic } = require("./topics");
class ReportfileUpdatedPublisher extends ServicePublisher {
  constructor(reportfile, session, requestId) {
    super(ReportfileUpdatedTopic, reportfile, session, requestId);
  }

  static async Publish(reportfile, session, requestId) {
    const _publisher = new ReportfileUpdatedPublisher(
      reportfile,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteReportFile route
const { ReportfileDeletedTopic } = require("./topics");
class ReportfileDeletedPublisher extends ServicePublisher {
  constructor(reportfile, session, requestId) {
    super(ReportfileDeletedTopic, reportfile, session, requestId);
  }

  static async Publish(reportfile, session, requestId) {
    const _publisher = new ReportfileDeletedPublisher(
      reportfile,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// ReportPolicy Event Publisher Classes

// Publisher class for createReportPolicy route
const { ReportpolicyCreatedTopic } = require("./topics");
class ReportpolicyCreatedPublisher extends ServicePublisher {
  constructor(reportpolicy, session, requestId) {
    super(ReportpolicyCreatedTopic, reportpolicy, session, requestId);
  }

  static async Publish(reportpolicy, session, requestId) {
    const _publisher = new ReportpolicyCreatedPublisher(
      reportpolicy,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateReportPolicy route
const { ReportpolicyUpdatedTopic } = require("./topics");
class ReportpolicyUpdatedPublisher extends ServicePublisher {
  constructor(reportpolicy, session, requestId) {
    super(ReportpolicyUpdatedTopic, reportpolicy, session, requestId);
  }

  static async Publish(reportpolicy, session, requestId) {
    const _publisher = new ReportpolicyUpdatedPublisher(
      reportpolicy,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteReportPolicy route
const { ReportpolicyDeletedTopic } = require("./topics");
class ReportpolicyDeletedPublisher extends ServicePublisher {
  constructor(reportpolicy, session, requestId) {
    super(ReportpolicyDeletedTopic, reportpolicy, session, requestId);
  }

  static async Publish(reportpolicy, session, requestId) {
    const _publisher = new ReportpolicyDeletedPublisher(
      reportpolicy,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

module.exports = {
  ReportrequestCreatedPublisher,
  ReportrequestUpdatedPublisher,
  ReportrequestDeletedPublisher,
  ReportfileCreatedPublisher,
  ReportfileUpdatedPublisher,
  ReportfileDeletedPublisher,
  ReportpolicyCreatedPublisher,
  ReportpolicyUpdatedPublisher,
  ReportpolicyDeletedPublisher,
};
