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

import { useReportingGetReportRequest } from "src/actions/reporting";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function ReportingGetReportRequestApiPage() {
  const [view, setView] = useState("Table");

  const [inputReportRequestId, setInputReportRequestId] = useState("");
  const [submittedReportRequestId, setSubmittedReportRequestId] =
    useState(null);

  const { reportrequest, reportrequestLoading, reportrequestError } =
    useReportingGetReportRequest(submittedReportRequestId);

  const handleGetReportrequest = () => {
    setSubmittedReportRequestId(inputReportRequestId);
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
              label="reportRequestId"
              value={inputReportRequestId}
              onChange={(e) => setInputReportRequestId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetReportrequest}
            disabled={!inputReportRequestId || reportrequestLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!reportrequestLoading && (reportrequestError || reportrequest) && (
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
                color={reportrequestError ? "error" : "success"}
                display="inline"
              >
                {reportrequestError ? reportrequestError.status : "200"}
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
              <TableResponse
                content={reportrequest}
                error={reportrequestError}
              />
            ) : (
              <JsonResponse content={reportrequest || reportrequestError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
