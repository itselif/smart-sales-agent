import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { JsonResponse } from "../../../../components/json-response/index.js";
import { TableResponse } from "../../../../components/table-response/index.js";
import inventoryManagementAxios, {
  inventoryManagementEndpoints,
} from "../../../../lib/inventoryManagement-axios.js";

export default function InventoryManagementDeleteLowStockAlertApiPage() {
  const [view, setView] = useState("Table");
  const [deletedLowstockalert, setDeletedLowstockalert] = useState(null);
  const [lowstockalertLoading, setLowstockalertLoading] = useState(false);

  const [error, setError] = useState(null);

  const [inputLowStockAlertId, setInputLowStockAlertId] = useState("");

  const handleDeleteLowstockalert = async () => {
    try {
      setLowstockalertLoading(true);
      const response = await inventoryManagementAxios.delete(
        inventoryManagementEndpoints.lowstockalert.deleteLowStockAlert.replace(
          ":lowStockAlertId",
          inputLowStockAlertId,
        ),
      );
      setError(null);
      setDeletedLowstockalert(null);
      console.info("RESPONSE", response);
      setDeletedLowstockalert(response.data.lowstockalert);
      setLowstockalertLoading(false);

      setInputLowStockAlertId("");
    } catch (ex) {
      console.error(ex);
      setError(ex);
      setLowstockalertLoading(false);
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
                label="lowStockAlertId"
                value={inputLowStockAlertId}
                onChange={(e) => setInputLowStockAlertId(e.target.value)}
              />
            </Box>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteLowstockalert}
              disabled={!inputLowStockAlertId || lowstockalertLoading}
            >
              DELETE
            </Button>
          </Box>
        </Box>
      </Box>
      <Divider />

      {!lowstockalertLoading && (error || deletedLowstockalert) && (
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
              <TableResponse content={deletedLowstockalert} error={error} />
            ) : (
              <JsonResponse content={deletedLowstockalert || error} />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
