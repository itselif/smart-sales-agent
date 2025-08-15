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

import { useObservabilityGetAuditLog } from "src/actions/observability";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function ObservabilityGetAuditLogApiPage() {
  const [view, setView] = useState("Table");

  const [inputAuditLogId, setInputAuditLogId] = useState("");
  const [submittedAuditLogId, setSubmittedAuditLogId] = useState(null);

  const { auditlog, auditlogLoading, auditlogError } =
    useObservabilityGetAuditLog(submittedAuditLogId);

  const handleGetAuditlog = () => {
    setSubmittedAuditLogId(inputAuditLogId);
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
              label="auditLogId"
              value={inputAuditLogId}
              onChange={(e) => setInputAuditLogId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetAuditlog}
            disabled={!inputAuditLogId || auditlogLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!auditlogLoading && (auditlogError || auditlog) && (
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
                color={auditlogError ? "error" : "success"}
                display="inline"
              >
                {auditlogError ? auditlogError.status : "200"}
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
              <TableResponse content={auditlog} error={auditlogError} />
            ) : (
              <JsonResponse content={auditlog || auditlogError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
