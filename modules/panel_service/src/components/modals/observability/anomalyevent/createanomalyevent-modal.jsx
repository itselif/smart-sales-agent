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

import observabilityAxios, {
  observabilityEndpoints,
} from "../../../../lib/observability-axios.js";

const ADD_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const requestParams = [
  { name: "anomalyType", value: "", type: "String" },

  { name: "triggeredByUserId", value: "", type: "ID" },

  { name: "affectedUserId", value: "", type: "ID" },

  { name: "storeId", value: "", type: "ID" },

  { name: "relatedEntityType", value: "", type: "String" },

  { name: "relatedEntityId", value: "", type: "String" },

  { name: "description", value: "", type: "Text" },

  { name: "detectedAt", value: "", type: "Date" },

  { name: "severity", value: "", type: "Enum" },

  { name: "status", value: "", type: "Enum" },

  { name: "reviewedByUserId", value: "", type: "ID" },
];

const AnomalyeventSchema = zod.object({
  anomalyType: zod.string().min(1, { message: "anomalyType is required" }),

  triggeredByUserId: zod.string().nullable(),

  affectedUserId: zod.string().nullable(),

  storeId: zod.string().nullable(),

  relatedEntityType: zod.string().nullable(),

  relatedEntityId: zod.string().nullable(),

  description: zod.string().nullable(),

  detectedAt: zod.string().min(1, { message: "detectedAt is required" }),

  severity: zod.string().min(1, { message: "severity is required" }),

  status: zod.string().min(1, { message: "status is required" }),

  reviewedByUserId: zod.string().nullable(),
});

export default function ObservabilityCreateAnomalyEventModal({ openDialog }) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const defaultValues = {
    anomalyType: "",

    triggeredByUserId: "",

    affectedUserId: "",

    storeId: "",

    relatedEntityType: "",

    relatedEntityId: "",

    description: "",

    detectedAt: "",

    severity: "",

    status: "",

    reviewedByUserId: "",
  };

  const methods = useForm({
    resolver: zodResolver(AnomalyeventSchema),
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
      const response = await observabilityAxios.post(
        observabilityEndpoints.anomalyEvent.createAnomalyEvent,
        data,
      );
      setError(null);
      reset();
      console.info("RESPONSE", response);
      await mutate([observabilityEndpoints.anomalyEvent.listAnomalyEvents]);
      openDialog.onFalse();
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Create AnomalyEvent</DialogTitle>

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
                : "An error occurred while creating the anomalyEvent."}
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
