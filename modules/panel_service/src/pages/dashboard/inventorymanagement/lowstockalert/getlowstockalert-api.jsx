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

import { useInventoryManagementGetLowStockAlert } from "src/actions/inventoryManagement";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function InventoryManagementGetLowStockAlertApiPage() {
  const [view, setView] = useState("Table");

  const [inputLowStockAlertId, setInputLowStockAlertId] = useState("");
  const [submittedLowStockAlertId, setSubmittedLowStockAlertId] =
    useState(null);

  const { lowstockalert, lowstockalertLoading, lowstockalertError } =
    useInventoryManagementGetLowStockAlert(submittedLowStockAlertId);

  const handleGetLowstockalert = () => {
    setSubmittedLowStockAlertId(inputLowStockAlertId);
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
              label="lowStockAlertId"
              value={inputLowStockAlertId}
              onChange={(e) => setInputLowStockAlertId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetLowstockalert}
            disabled={!inputLowStockAlertId || lowstockalertLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!lowstockalertLoading && (lowstockalertError || lowstockalert) && (
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
                color={lowstockalertError ? "error" : "success"}
                display="inline"
              >
                {lowstockalertError ? lowstockalertError.status : "200"}
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
                content={lowstockalert}
                error={lowstockalertError}
              />
            ) : (
              <JsonResponse content={lowstockalert || lowstockalertError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
