import * as zod from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Chip,
  Link,
  Table,
  Paper,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  ToggleButton,
  TableContainer,
  ToggleButtonGroup,
} from "@mui/material";

import { Form, Field } from "../../../../components/hook-form";
import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";
import inventoryManagementAxios, {
  inventoryManagementEndpoints,
} from "../../../../lib/inventoryManagement-axios.js";

const requestParams = [
  { name: "quantity", value: "", type: "Integer" },

  { name: "status", value: "", type: "Enum" },

  { name: "lowStockThreshold", value: "", type: "Integer" },

  { name: "lastSyncTimestamp", value: "", type: "Date" },
];

const InventoryitemSchema = zod.object({
  quantity: zod.number().nullable(),

  status: zod.string().nullable(),

  lowStockThreshold: zod.number().nullable(),

  lastSyncTimestamp: zod.string().nullable(),
});

export default function InventoryManagementUpdateInventoryItemApiPage() {
  const [view, setView] = useState("Table");
  const [updatedInventoryitem, setUpdatedInventoryitem] = useState(null);
  const [error, setError] = useState(null);

  const [inputInventoryItemId, setInputInventoryItemId] = useState("");

  const theme = useTheme();

  const defaultValues = {
    quantity: "",

    status: "",

    lowStockThreshold: "",

    lastSyncTimestamp: "",
  };

  const methods = useForm({
    resolver: zodResolver(InventoryitemSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await inventoryManagementAxios.patch(
        inventoryManagementEndpoints.inventoryItem.updateInventoryItem.replace(
          ":inventoryItemId",
          inputInventoryItemId,
        ),
        data,
      );
      setError(null);
      setUpdatedInventoryitem(null);
      reset();
      console.info("RESPONSE", response);
      setUpdatedInventoryitem(response.data.inventoryItem);
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Box marginY="2rem">
        <Box marginBottom="2rem">
          <Typography variant="h4" marginBottom="1.5rem">
            UPDATE
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
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="30%">
                  <Typography variant="body1" fontWeight="bold">
                    Property Name
                  </Typography>
                </TableCell>
                <TableCell width="70%">
                  <Typography variant="body1" fontWeight="bold">
                    Property Value
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requestParams.map((row) => (
                <TableRow key={row.name}>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <Chip variant="soft" label={row.name} />
                  </TableCell>
                  <TableCell>
                    {row.type === "Boolean" ? (
                      <Field.Checkbox name={row.name} />
                    ) : (
                      <Field.Text name={row.name} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Link component="button" underline="always" onClick={() => reset()}>
            Cancel
          </Link>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
          >
            Save
          </LoadingButton>
        </Box>
      </Box>
      <Divider />
      {(updatedInventoryitem || error) && (
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
                {error ? (error.status ?? "500") : "200"}
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
              <TableResponse content={updatedInventoryitem} error={error} />
            ) : (
              <JsonResponse content={updatedInventoryitem || error} />
            )}
          </Box>
        </Box>
      )}
    </Form>
  );
}
