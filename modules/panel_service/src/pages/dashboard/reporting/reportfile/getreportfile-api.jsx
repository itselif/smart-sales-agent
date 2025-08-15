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

import { useReportingGetReportFile } from "src/actions/reporting";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function ReportingGetReportFileApiPage() {
  const [view, setView] = useState("Table");

  const [inputReportFileId, setInputReportFileId] = useState("");
  const [submittedReportFileId, setSubmittedReportFileId] = useState(null);

  const { reportfile, reportfileLoading, reportfileError } =
    useReportingGetReportFile(submittedReportFileId);

  const handleGetReportfile = () => {
    setSubmittedReportFileId(inputReportFileId);
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
              label="reportFileId"
              value={inputReportFileId}
              onChange={(e) => setInputReportFileId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetReportfile}
            disabled={!inputReportFileId || reportfileLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!reportfileLoading && (reportfileError || reportfile) && (
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
                color={reportfileError ? "error" : "success"}
                display="inline"
              >
                {reportfileError ? reportfileError.status : "200"}
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
              <TableResponse content={reportfile} error={reportfileError} />
            ) : (
              <JsonResponse content={reportfile || reportfileError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
