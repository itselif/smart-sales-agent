const { elasticClient } = require("common/elasticsearch");

const {
  salesDashboardViewAggregateData,
} = require("aggregates/salesDashboardView.aggregate");

const {
  inventoryDashboardViewAggregateData,
} = require("aggregates/inventoryDashboardView.aggregate");

const {
  auditLogViewAggregateData,
} = require("aggregates/auditLogView.aggregate");

const {
  crossStoreComparisonViewAggregateData,
} = require("aggregates/crossStoreComparisonView.aggregate");

const runAllRepair = async () => {
  console.group("Repair started at ", new Date());

  await salesDashboardViewRepair();

  await inventoryDashboardViewRepair();

  await auditLogViewRepair();

  await crossStoreComparisonViewRepair();

  console.groupEnd();
};

const salesDashboardViewRepair = async () => {
  try {
    console.group("salesDashboardViewRepair started at ", new Date());
    await checkIndex("salesai1_salesdashboardview");
    const result = await elasticClient.search({
      index: "salesai1_saleTransaction",
      body: {
        query: { match_all: {} },
      },
    });

    const ids = result?.hits?.hits.map((hit) => hit._source.id);
    await salesDashboardViewAggregateData(ids);
    console.log("Repair completed for salesdashboardview");
  } catch (error) {
    console.error("salesDashboardViewRepair failed at ", new Date(), error);
  } finally {
    console.groupEnd();
  }
};

const inventoryDashboardViewRepair = async () => {
  try {
    console.group("inventoryDashboardViewRepair started at ", new Date());
    await checkIndex("salesai1_inventorydashboardview");
    const result = await elasticClient.search({
      index: "salesai1_inventoryItem",
      body: {
        query: { match_all: {} },
      },
    });

    const ids = result?.hits?.hits.map((hit) => hit._source.id);
    await inventoryDashboardViewAggregateData(ids);
    console.log("Repair completed for inventorydashboardview");
  } catch (error) {
    console.error("inventoryDashboardViewRepair failed at ", new Date(), error);
  } finally {
    console.groupEnd();
  }
};

const auditLogViewRepair = async () => {
  try {
    console.group("auditLogViewRepair started at ", new Date());
    await checkIndex("salesai1_auditlogview");
    const result = await elasticClient.search({
      index: "salesai1_auditLog",
      body: {
        query: { match_all: {} },
      },
    });

    const ids = result?.hits?.hits.map((hit) => hit._source.id);
    await auditLogViewAggregateData(ids);
    console.log("Repair completed for auditlogview");
  } catch (error) {
    console.error("auditLogViewRepair failed at ", new Date(), error);
  } finally {
    console.groupEnd();
  }
};

const crossStoreComparisonViewRepair = async () => {
  try {
    console.group("crossStoreComparisonViewRepair started at ", new Date());
    await checkIndex("salesai1_crossstorecomparisonview");
    const result = await elasticClient.search({
      index: "salesai1_store",
      body: {
        query: { match_all: {} },
      },
    });

    const ids = result?.hits?.hits.map((hit) => hit._source.id);
    await crossStoreComparisonViewAggregateData(ids);
    console.log("Repair completed for crossstorecomparisonview");
  } catch (error) {
    console.error(
      "crossStoreComparisonViewRepair failed at ",
      new Date(),
      error,
    );
  } finally {
    console.groupEnd();
  }
};

// check index is exists and create if not exists
const checkIndex = async (index) => {
  const result = await elasticClient.indices.exists({ index });
  if (!result) {
    console.log("Index not found, creating index", index);
    await elasticClient.indices.create({ index });
    return;
  }
  console.log("Index found, skipping creation", index);
};

module.exports = { runAllRepair };
