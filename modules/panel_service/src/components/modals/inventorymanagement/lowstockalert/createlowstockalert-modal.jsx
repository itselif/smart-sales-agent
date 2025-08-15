import {
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { TableHeadCustom } from "../../../table/index.js";
import { Iconify } from "../../../iconify/index.js";
import { useTheme } from "@mui/material/styles";

import { Form, Field } from "../../../hook-form";
import * as zod from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@mui/lab/LoadingButton";
import { mutate } from "swr";

import inventoryManagementAxios, {
  inventoryManagementEndpoints,
} from "../../../../lib/inventoryManagement-axios.js";

const ADD_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const requestParams = [
  { name: "inventoryItemId", value: "", type: "ID" },

  { name: "alertType", value: "", type: "Enum" },

  { name: "alertTimestamp", value: "", type: "Date" },

  { name: "resolved", value: false, type: "Boolean" },

  { name: "resolvedByUserId", value: "", type: "ID" },

  { name: "resolvedTimestamp", value: "", type: "Date" },
];

const LowstockalertSchema = zod.object({
  inventoryItemId: zod
    .string()
    .min(1, { message: "inventoryItemId is required" }),

  alertType: zod.string().min(1, { message: "alertType is required" }),

  alertTimestamp: zod
    .string()
    .min(1, { message: "alertTimestamp is required" }),

  resolved: zod.boolean().nullable(),

  resolvedByUserId: zod.string().nullable(),

  resolvedTimestamp: zod.string().nullable(),
});

export default function InventoryManagementCreateLowStockAlertModal({
  openDialog,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const defaultValues = {
    inventoryItemId: "",

    alertType: "",

    alertTimestamp: "",

    resolved: false,

    resolvedByUserId: "",

    resolvedTimestamp: "",
  };

  const methods = useForm({
    resolver: zodResolver(LowstockalertSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await inventoryManagementAxios.post(
        inventoryManagementEndpoints.lowStockAlert.createLowStockAlert,
        data,
      );
      setError(null);
      reset();
      console.info("RESPONSE", response);
      await mutate([
        inventoryManagementEndpoints.lowStockAlert.listLowStockAlerts,
      ]);
      openDialog.onFalse();
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Create LowStockAlert</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 600 }}>
              <TableHeadCustom headCells={ADD_TABLE_HEAD} />

              <TableBody>
                {requestParams.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell
                      sx={{ backgroundColor: theme.palette.grey[100] }}
                    >
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
          {error && (
            <DialogContentText color="error">
              {error.message
                ? error.message
                : "An error occurred while creating the lowStockAlert."}
            </DialogContentText>
          )}
        </DialogContent>

        <DialogActions className="gap-2">
          <Link
            component="button"
            type="button"
            underline="always"
            onClick={openDialog.onFalse}
          >
            Cancel
          </Link>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
            startIcon={<Iconify icon="material-symbols:save-outline" />}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
