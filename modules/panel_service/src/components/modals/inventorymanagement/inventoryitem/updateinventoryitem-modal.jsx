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
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@mui/lab/LoadingButton";
import { mutate } from "swr";

import inventoryManagementAxios, {
  inventoryManagementEndpoints,
} from "../../../../lib/inventoryManagement-axios.js";

const UPDATE_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const InventoryitemSchema = zod.object({
  quantity: zod.number().nullable(),

  status: zod.string().nullable(),

  lowStockThreshold: zod.number().nullable(),

  lastSyncTimestamp: zod.string().nullable(),
});

export default function InventoryManagementUpdateInventoryItemModal({
  openDialog,
  selectedInventoryItem,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const requestParams = [
    {
      name: "quantity",
      value: selectedInventoryItem?.quantity ?? "",
      type: "Integer",
    },

    {
      name: "status",
      value: selectedInventoryItem?.status ?? "",
      type: "Enum",
    },

    {
      name: "lowStockThreshold",
      value: selectedInventoryItem?.lowStockThreshold ?? "",
      type: "Integer",
    },

    {
      name: "lastSyncTimestamp",
      value: selectedInventoryItem?.lastSyncTimestamp ?? "",
      type: "Date",
    },
  ];

  const defaultValues = {
    quantity: selectedInventoryItem?.quantity ?? "",

    status: selectedInventoryItem?.status ?? "",

    lowStockThreshold: selectedInventoryItem?.lowStockThreshold ?? "",

    lastSyncTimestamp: selectedInventoryItem?.lastSyncTimestamp ?? "",
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (selectedInventoryItem?.id) {
        const response = await inventoryManagementAxios.patch(
          inventoryManagementEndpoints.inventoryItem.updateInventoryItem.replace(
            ":inventoryItemId",
            selectedInventoryItem?.id,
          ),
          data,
        );
        setError(null);
        reset();
        console.info("RESPONSE", response);
        await mutate([
          inventoryManagementEndpoints.inventoryItem.listInventoryItems,
        ]);
        openDialog.onFalse();
      }
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  useEffect(() => {
    methods.reset({
      quantity: selectedInventoryItem?.quantity ?? "",

      status: selectedInventoryItem?.status ?? "",

      lowStockThreshold: selectedInventoryItem?.lowStockThreshold ?? "",

      lastSyncTimestamp: selectedInventoryItem?.lastSyncTimestamp ?? "",
    });
  }, [selectedInventoryItem]);

  if (!selectedInventoryItem) return null;

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Update InventoryItem</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 600 }}>
              <TableHeadCustom headCells={UPDATE_TABLE_HEAD} />

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
                : "An error occurred while creating the inventoryItem."}
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
