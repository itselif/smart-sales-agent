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

import observabilityAxios, {
  observabilityEndpoints,
} from "../../../../lib/observability-axios.js";

const UPDATE_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const MetricdatapointSchema = zod.object({
  value: zod.number().nullable(),

  flagAnomalous: zod.boolean().nullable(),

  context: zod.string().nullable(),
});

export default function ObservabilityUpdateMetricDatapointModal({
  openDialog,
  selectedMetricDatapoint,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const requestParams = [
    {
      name: "value",
      value: selectedMetricDatapoint?.value ?? "",
      type: "Double",
    },

    {
      name: "flagAnomalous",
      value: selectedMetricDatapoint?.flagAnomalous ?? false,
      type: "Boolean",
    },

    {
      name: "context",
      value: selectedMetricDatapoint?.context ?? "",
      type: "Object",
    },
  ];

  const defaultValues = {
    value: selectedMetricDatapoint?.value ?? "",

    flagAnomalous: selectedMetricDatapoint?.flagAnomalous ?? false,

    context: selectedMetricDatapoint?.context ?? "",
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
      if (selectedMetricDatapoint?.id) {
        const response = await observabilityAxios.patch(
          observabilityEndpoints.metricDatapoint.updateMetricDatapoint.replace(
            ":metricDatapointId",
            selectedMetricDatapoint?.id,
          ),
          data,
        );
        setError(null);
        reset();
        console.info("RESPONSE", response);
        await mutate([
          observabilityEndpoints.metricDatapoint.listMetricDatapoints,
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
      value: selectedMetricDatapoint?.value ?? "",

      flagAnomalous: selectedMetricDatapoint?.flagAnomalous ?? false,

      context: selectedMetricDatapoint?.context ?? "",
    });
  }, [selectedMetricDatapoint]);

  if (!selectedMetricDatapoint) return null;

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Update MetricDatapoint</DialogTitle>

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
