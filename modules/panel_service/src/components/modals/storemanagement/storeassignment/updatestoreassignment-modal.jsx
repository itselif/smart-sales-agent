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

const StoreassignmentSchema = zod.object({
  assignmentType: zod.string().nullable(),

  status: zod.string().nullable(),

  overrideJustification: zod.string().nullable(),

  validFrom: zod.string().nullable(),

  validUntil: zod.string().nullable(),
});

export default function StoreManagementUpdateStoreAssignmentModal({
  openDialog,
  selectedStoreAssignment,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const requestParams = [
    {
      name: "assignmentType",
      value: selectedStoreAssignment?.assignmentType ?? "",
      type: "Enum",
    },

    {
      name: "status",
      value: selectedStoreAssignment?.status ?? "",
      type: "Enum",
    },

    {
      name: "overrideJustification",
      value: selectedStoreAssignment?.overrideJustification ?? "",
      type: "Text",
    },

    {
      name: "validFrom",
      value: selectedStoreAssignment?.validFrom ?? "",
      type: "Date",
    },

    {
      name: "validUntil",
      value: selectedStoreAssignment?.validUntil ?? "",
      type: "Date",
    },
  ];

  const defaultValues = {
    assignmentType: selectedStoreAssignment?.assignmentType ?? "",

    status: selectedStoreAssignment?.status ?? "",

    overrideJustification: selectedStoreAssignment?.overrideJustification ?? "",

    validFrom: selectedStoreAssignment?.validFrom ?? "",

    validUntil: selectedStoreAssignment?.validUntil ?? "",
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
      if (selectedStoreAssignment?.id) {
        const response = await storeManagementAxios.patch(
          storeManagementEndpoints.storeAssignment.updateStoreAssignment.replace(
            ":storeAssignmentId",
            selectedStoreAssignment?.id,
          ),
          data,
        );
        setError(null);
        reset();
        console.info("RESPONSE", response);
        await mutate([
          storeManagementEndpoints.storeAssignment.listStoreAssignments,
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
      assignmentType: selectedStoreAssignment?.assignmentType ?? "",

      status: selectedStoreAssignment?.status ?? "",

      overrideJustification:
        selectedStoreAssignment?.overrideJustification ?? "",

      validFrom: selectedStoreAssignment?.validFrom ?? "",

      validUntil: selectedStoreAssignment?.validUntil ?? "",
    });
  }, [selectedStoreAssignment]);

  if (!selectedStoreAssignment) return null;

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Update StoreAssignment</DialogTitle>

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
