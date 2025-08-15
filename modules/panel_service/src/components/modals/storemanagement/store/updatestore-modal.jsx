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

import storeManagementAxios, {
  storeManagementEndpoints,
} from "../../../../lib/storeManagement-axios.js";

const UPDATE_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const StoreSchema = zod.object({
  name: zod.string().nullable(),

  fullname: zod.string().nullable(),

  city: zod.string().nullable(),

  avatar: zod.string().nullable(),

  active: zod.boolean().nullable(),
});

export default function StoreManagementUpdateStoreModal({
  openDialog,
  selectedStore,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const requestParams = [
    { name: "name", value: selectedStore?.name ?? "", type: "String" },

    { name: "fullname", value: selectedStore?.fullname ?? "", type: "String" },

    { name: "city", value: selectedStore?.city ?? "", type: "String" },

    { name: "avatar", value: selectedStore?.avatar ?? "", type: "String" },

    { name: "active", value: selectedStore?.active ?? false, type: "Boolean" },
  ];

  const defaultValues = {
    name: selectedStore?.name ?? "",

    fullname: selectedStore?.fullname ?? "",

    city: selectedStore?.city ?? "",

    avatar: selectedStore?.avatar ?? "",

    active: selectedStore?.active ?? false,
  };

  const methods = useForm({
    resolver: zodResolver(StoreSchema),
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
      if (selectedStore?.id) {
        const response = await storeManagementAxios.patch(
          storeManagementEndpoints.store.updateStore.replace(
            ":storeId",
            selectedStore?.id,
          ),
          data,
        );
        setError(null);
        reset();
        console.info("RESPONSE", response);
        await mutate([storeManagementEndpoints.store.listStores]);
        openDialog.onFalse();
      }
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  useEffect(() => {
    methods.reset({
      name: selectedStore?.name ?? "",

      fullname: selectedStore?.fullname ?? "",

      city: selectedStore?.city ?? "",

      avatar: selectedStore?.avatar ?? "",

      active: selectedStore?.active ?? false,
    });
  }, [selectedStore]);

  if (!selectedStore) return null;

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Update Store</DialogTitle>

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
                : "An error occurred while creating the store."}
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
