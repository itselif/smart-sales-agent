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

import storeManagementAxios, {
  storeManagementEndpoints,
} from "../../../../lib/storeManagement-axios.js";

const ADD_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const requestParams = [
  { name: "userId", value: "", type: "ID" },

  { name: "storeId", value: "", type: "ID" },

  { name: "role", value: "", type: "Enum" },

  { name: "assignmentType", value: "", type: "Enum" },

  { name: "status", value: "", type: "Enum" },

  { name: "overrideJustification", value: "", type: "Text" },

  { name: "validFrom", value: "", type: "Date" },

  { name: "validUntil", value: "", type: "Date" },
];

const StoreassignmentSchema = zod.object({
  userId: zod.string().min(1, { message: "userId is required" }),

  storeId: zod.string().min(1, { message: "storeId is required" }),

  role: zod.string().min(1, { message: "role is required" }),

  assignmentType: zod
    .string()
    .min(1, { message: "assignmentType is required" }),

  status: zod.string().min(1, { message: "status is required" }),

  overrideJustification: zod.string().nullable(),

  validFrom: zod.string().nullable(),

  validUntil: zod.string().nullable(),
});

export default function StoreManagementCreateStoreAssignmentModal({
  openDialog,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const defaultValues = {
    userId: "",

    storeId: "",

    role: "",

    assignmentType: "",

    status: "",

    overrideJustification: "",

    validFrom: "",

    validUntil: "",
  };

  const methods = useForm({
    resolver: zodResolver(StoreassignmentSchema),
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
      const response = await storeManagementAxios.post(
        storeManagementEndpoints.storeAssignment.createStoreAssignment,
        data,
      );
      setError(null);
      reset();
      console.info("RESPONSE", response);
      await mutate([
        storeManagementEndpoints.storeAssignment.listStoreAssignments,
      ]);
      openDialog.onFalse();
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Create StoreAssignment</DialogTitle>

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
                : "An error occurred while creating the storeAssignment."}
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
