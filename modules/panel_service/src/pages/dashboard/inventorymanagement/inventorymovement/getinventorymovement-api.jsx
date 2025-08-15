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

import { useInventoryManagementGetInventoryMovement } from "src/actions/inventoryManagement";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function InventoryManagementGetInventoryMovementApiPage() {
  const [view, setView] = useState("Table");

  const [inputInventoryMovementId, setInputInventoryMovementId] = useState("");
  const [submittedInventoryMovementId, setSubmittedInventoryMovementId] =
    useState(null);

  const {
    inventorymovement,
    inventorymovementLoading,
    inventorymovementError,
  } = useInventoryManagementGetInventoryMovement(submittedInventoryMovementId);

  const handleGetInventorymovement = () => {
    setSubmittedInventoryMovementId(inputInventoryMovementId);
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
              label="inventoryMovementId"
              value={inputInventoryMovementId}
              onChange={(e) => setInputInventoryMovementId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetInventorymovement}
            disabled={!inputInventoryMovementId || inventorymovementLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!inventorymovementLoading &&
        (inventorymovementError || inventorymovement) && (
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
                  color={inventorymovementError ? "error" : "success"}
                  display="inline"
                >
                  {inventorymovementError
                    ? inventorymovementError.status
                    : "200"}
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
                  content={inventorymovement}
                  error={inventorymovementError}
                />
              ) : (
                <JsonResponse
                  content={inventorymovement || inventorymovementError}
                />
              )}
            </Box>
          </Box>
        )}
    </>
  );
}
