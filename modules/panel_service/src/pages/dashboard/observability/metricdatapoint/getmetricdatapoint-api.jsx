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

import { useObservabilityGetMetricDatapoint } from "src/actions/observability";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function ObservabilityGetMetricDatapointApiPage() {
  const [view, setView] = useState("Table");

  const [inputMetricDatapointId, setInputMetricDatapointId] = useState("");
  const [submittedMetricDatapointId, setSubmittedMetricDatapointId] =
    useState(null);

  const { metricdatapoint, metricdatapointLoading, metricdatapointError } =
    useObservabilityGetMetricDatapoint(submittedMetricDatapointId);

  const handleGetMetricdatapoint = () => {
    setSubmittedMetricDatapointId(inputMetricDatapointId);
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
              label="metricDatapointId"
              value={inputMetricDatapointId}
              onChange={(e) => setInputMetricDatapointId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetMetricdatapoint}
            disabled={!inputMetricDatapointId || metricdatapointLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!metricdatapointLoading && (metricdatapointError || metricdatapoint) && (
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
                color={metricdatapointError ? "error" : "success"}
                display="inline"
              >
                {metricdatapointError ? metricdatapointError.status : "200"}
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
                content={metricdatapoint}
                error={metricdatapointError}
              />
            ) : (
              <JsonResponse content={metricdatapoint || metricdatapointError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
