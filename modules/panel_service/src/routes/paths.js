const ROOTS = {
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
};

export const paths = {
  auth: {
    login: `/`,
  },

  dashboard: {
    root: ROOTS.DASHBOARD,

    salesManagement: {
      root: `${ROOTS.DASHBOARD}/salesManagement`,

      saleTransaction: `${ROOTS.DASHBOARD}/salesManagement/saleTransaction`,

      saleTransactionHistory: `${ROOTS.DASHBOARD}/salesManagement/saleTransactionHistory`,
    },

    inventoryManagement: {
      root: `${ROOTS.DASHBOARD}/inventoryManagement`,

      inventoryItem: `${ROOTS.DASHBOARD}/inventoryManagement/inventoryItem`,

      inventoryMovement: `${ROOTS.DASHBOARD}/inventoryManagement/inventoryMovement`,

      lowStockAlert: `${ROOTS.DASHBOARD}/inventoryManagement/lowStockAlert`,
    },

    storeManagement: {
      root: `${ROOTS.DASHBOARD}/storeManagement`,

      store: `${ROOTS.DASHBOARD}/storeManagement/store`,

      storeAssignment: `${ROOTS.DASHBOARD}/storeManagement/storeAssignment`,
    },

    reporting: {
      root: `${ROOTS.DASHBOARD}/reporting`,

      reportRequest: `${ROOTS.DASHBOARD}/reporting/reportRequest`,

      reportFile: `${ROOTS.DASHBOARD}/reporting/reportFile`,

      reportPolicy: `${ROOTS.DASHBOARD}/reporting/reportPolicy`,
    },

    observability: {
      root: `${ROOTS.DASHBOARD}/observability`,

      auditLog: `${ROOTS.DASHBOARD}/observability/auditLog`,

      metricDatapoint: `${ROOTS.DASHBOARD}/observability/metricDatapoint`,

      anomalyEvent: `${ROOTS.DASHBOARD}/observability/anomalyEvent`,
    },

    platformAdmin: {
      root: `${ROOTS.DASHBOARD}/platformAdmin`,

      openApiSchema: `${ROOTS.DASHBOARD}/platformAdmin/openApiSchema`,
    },

    auth: {
      root: `${ROOTS.DASHBOARD}/auth`,

      user: `${ROOTS.DASHBOARD}/auth/user`,

      userGroup: `${ROOTS.DASHBOARD}/auth/userGroup`,

      userGroupMember: `${ROOTS.DASHBOARD}/auth/userGroupMember`,

      store: `${ROOTS.DASHBOARD}/auth/store`,
    },
  },
};
