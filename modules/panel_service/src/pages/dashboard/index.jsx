import { Helmet } from "react-helmet-async";

import Divider from "@mui/material/Divider";

import { CONFIG } from "src/global-config";

import { DashboardContent } from "../../layouts/dashboard/index.js";

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function OverviewAppPage() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        <h2>{CONFIG.appName}</h2>

        <Divider />
      </DashboardContent>
    </>
  );
}
