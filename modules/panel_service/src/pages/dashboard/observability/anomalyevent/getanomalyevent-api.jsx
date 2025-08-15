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

import { useObservabilityGetAnomalyEvent } from "src/actions/observability";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function ObservabilityGetAnomalyEventApiPage() {
  const [view, setView] = useState("Table");

  const [inputAnomalyEventId, setInputAnomalyEventId] = useState("");
  const [submittedAnomalyEventId, setSubmittedAnomalyEventId] = useState(null);

  const { anomalyevent, anomalyeventLoading, anomalyeventError } =
    useObservabilityGetAnomalyEvent(submittedAnomalyEventId);

  const handleGetAnomalyevent = () => {
    setSubmittedAnomalyEventId(inputAnomalyEventId);
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
              label="anomalyEventId"
              value={inputAnomalyEventId}
              onChange={(e) => setInputAnomalyEventId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetAnomalyevent}
            disabled={!inputAnomalyEventId || anomalyeventLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!anomalyeventLoading && (anomalyeventError || anomalyevent) && (
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
                color={anomalyeventError ? "error" : "success"}
                display="inline"
              >
                {anomalyeventError ? anomalyeventError.status : "200"}
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
              <TableResponse content={anomalyevent} error={anomalyeventError} />
            ) : (
              <JsonResponse content={anomalyevent || anomalyeventError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
