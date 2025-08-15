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

import { useSalesManagementGetSaleTransaction } from "src/actions/salesManagement";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function SalesManagementGetSaleTransactionApiPage() {
  const [view, setView] = useState("Table");

  const [inputSaleTransactionId, setInputSaleTransactionId] = useState("");
  const [submittedSaleTransactionId, setSubmittedSaleTransactionId] =
    useState(null);

  const { saletransaction, saletransactionLoading, saletransactionError } =
    useSalesManagementGetSaleTransaction(submittedSaleTransactionId);

  const handleGetSaletransaction = () => {
    setSubmittedSaleTransactionId(inputSaleTransactionId);
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
              label="saleTransactionId"
              value={inputSaleTransactionId}
              onChange={(e) => setInputSaleTransactionId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetSaletransaction}
            disabled={!inputSaleTransactionId || saletransactionLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!saletransactionLoading && (saletransactionError || saletransaction) && (
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
                color={saletransactionError ? "error" : "success"}
                display="inline"
              >
                {saletransactionError ? saletransactionError.status : "200"}
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
                content={saletransaction}
                error={saletransactionError}
              />
            ) : (
              <JsonResponse content={saletransaction || saletransactionError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
