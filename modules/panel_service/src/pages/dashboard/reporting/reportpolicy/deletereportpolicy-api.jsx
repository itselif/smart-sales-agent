import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { JsonResponse } from "../../../../components/json-response/index.js";
import { TableResponse } from "../../../../components/table-response/index.js";
import reportingAxios, {
  reportingEndpoints,
} from "../../../../lib/reporting-axios.js";

export default function ReportingDeleteReportPolicyApiPage() {
  const [view, setView] = useState("Table");
  const [deletedReportpolicy, setDeletedReportpolicy] = useState(null);
  const [reportpolicyLoading, setReportpolicyLoading] = useState(false);

  const [error, setError] = useState(null);

  const [inputReportPolicyId, setInputReportPolicyId] = useState("");

  const handleDeleteReportpolicy = async () => {
    try {
      setReportpolicyLoading(true);
      const response = await reportingAxios.delete(
        reportingEndpoints.reportpolicy.deleteReportPolicy.replace(
          ":reportPolicyId",
          inputReportPolicyId,
        ),
      );
      setError(null);
      setDeletedReportpolicy(null);
      console.info("RESPONSE", response);
      setDeletedReportpolicy(response.data.reportpolicy);
      setReportpolicyLoading(false);

      setInputReportPolicyId("");
    } catch (ex) {
      console.error(ex);
      setError(ex);
      setReportpolicyLoading(false);
    }
  };

  return (
    <Box>
      <Box marginY="2rem">
        <Box marginBottom="2rem">
          <Typography variant="h4" marginBottom="1.5rem">
            DELETE
          </Typography>

          <Box component="div" gap="1rem" display="flex" key="0">
            <Box minWidth="35%">
              <TextField
                size="small"
                variant="outlined"
                fullWidth
                label="reportPolicyId"
                value={inputReportPolicyId}
                onChange={(e) => setInputReportPolicyId(e.target.value)}
              />
            </Box>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteReportpolicy}
              disabled={!inputReportPolicyId || reportpolicyLoading}
            >
              DELETE
            </Button>
          </Box>
        </Box>
      </Box>
      <Divider />

      {!reportpolicyLoading && (error || deletedReportpolicy) && (
        <Box paddingTop="2rem">
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1">
              STATUS:{" "}
              <Typography
                component="span"
                variant="subtitle1"
                color={error ? "error" : "success"}
                display="inline"
              >
                {error ? error.status : "200"}
              </Typography>
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <ToggleButtonGroup
                color="standard"
                value={view}
                exclusive
                onChange={(_, val) => val && setView(val)}
              >
                <ToggleButton value="Table" sx={{ paddingX: "2rem" }}>
                  Table
                </ToggleButton>
                <ToggleButton value="JSON" sx={{ paddingX: "2rem" }}>
                  JSON
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          <Box>
            {view === "Table" ? (
              <TableResponse content={deletedReportpolicy} error={error} />
            ) : (
              <JsonResponse content={deletedReportpolicy || error} />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
