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
  { name: "metricType", value: "", type: "String" },

  { name: "targetType", value: "", type: "String" },

  { name: "targetId", value: "", type: "String" },

  { name: "periodStart", value: "", type: "Date" },

  { name: "granularity", value: "", type: "String" },

  { name: "value", value: "", type: "Double" },

  { name: "flagAnomalous", value: false, type: "Boolean" },

  { name: "observedByUserId", value: "", type: "ID" },

  { name: "context", value: "", type: "Object" },
];

const MetricdatapointSchema = zod.object({
  metricType: zod.string().min(1, { message: "metricType is required" }),

  targetType: zod.string().min(1, { message: "targetType is required" }),

  targetId: zod.string().nullable(),

  periodStart: zod.string().min(1, { message: "periodStart is required" }),

  granularity: zod.string().min(1, { message: "granularity is required" }),

  value: zod.number().min(1, { message: "value is required" }),

  flagAnomalous: zod.boolean().nullable(),

  observedByUserId: zod.string().nullable(),

  context: zod.string().nullable(),
});

export default function ObservabilityCreateMetricDatapointModal({
  openDialog,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const defaultValues = {
    metricType: "",

    targetType: "",

    targetId: "",

    periodStart: "",

    granularity: "",

    value: "",

    flagAnomalous: false,

    observedByUserId: "",

    context: "",
  };

  const methods = useForm({
    resolver: zodResolver(MetricdatapointSchema),
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
        observabilityEndpoints.metricDatapoint.createMetricDatapoint,
        data,
      );
      setError(null);
      reset();
      console.info("RESPONSE", response);
      await mutate([
        observabilityEndpoints.metricDatapoint.listMetricDatapoints,
      ]);
      openDialog.onFalse();
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Create MetricDatapoint</DialogTitle>

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
                : "An error occurred while creating the metricDatapoint."}
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
