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

import { useInventoryManagementGetInventoryItem } from "src/actions/inventoryManagement";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function InventoryManagementGetInventoryItemApiPage() {
  const [view, setView] = useState("Table");

  const [inputInventoryItemId, setInputInventoryItemId] = useState("");
  const [submittedInventoryItemId, setSubmittedInventoryItemId] =
    useState(null);

  const { inventoryitem, inventoryitemLoading, inventoryitemError } =
    useInventoryManagementGetInventoryItem(submittedInventoryItemId);

  const handleGetInventoryitem = () => {
    setSubmittedInventoryItemId(inputInventoryItemId);
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
              label="inventoryItemId"
              value={inputInventoryItemId}
              onChange={(e) => setInputInventoryItemId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetInventoryitem}
            disabled={!inputInventoryItemId || inventoryitemLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!inventoryitemLoading && (inventoryitemError || inventoryitem) && (
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
                color={inventoryitemError ? "error" : "success"}
                display="inline"
              >
                {inventoryitemError ? inventoryitemError.status : "200"}
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
                content={inventoryitem}
                error={inventoryitemError}
              />
            ) : (
              <JsonResponse content={inventoryitem || inventoryitemError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
