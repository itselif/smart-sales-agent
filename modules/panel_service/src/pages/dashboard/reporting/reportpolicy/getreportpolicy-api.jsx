import { useState } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {
  Button,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { useReportingGetReportPolicy } from "src/actions/reporting";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function ReportingGetReportPolicyApiPage() {
  const [view, setView] = useState("Table");

  const [inputReportPolicyId, setInputReportPolicyId] = useState("");
  const [submittedReportPolicyId, setSubmittedReportPolicyId] = useState(null);

  const { reportpolicy, reportpolicyLoading, reportpolicyError } =
    useReportingGetReportPolicy(submittedReportPolicyId);

  const handleGetReportpolicy = () => {
    setSubmittedReportPolicyId(inputReportPolicyId);
  };

  return (
    <>
      <Box marginY="2rem">
        <Typography variant="h4" marginBottom="1.5rem">
          GET
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
            onClick={handleGetReportpolicy}
            disabled={!inputReportPolicyId || reportpolicyLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!reportpolicyLoading && (reportpolicyError || reportpolicy) && (
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
                color={reportpolicyError ? "error" : "success"}
                display="inline"
              >
                {reportpolicyError ? reportpolicyError.status : "200"}
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
              <TableResponse content={reportpolicy} error={reportpolicyError} />
            ) : (
              <JsonResponse content={reportpolicy || reportpolicyError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
