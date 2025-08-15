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

import reportingAxios, {
  reportingEndpoints,
} from "../../../../lib/reporting-axios.js";

const ADD_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const requestParams = [
  { name: "reportType", value: "", type: "Enum" },

  { name: "storeIds", value: "", type: "ID" },

  { name: "dateFrom", value: "", type: "Date" },

  { name: "dateTo", value: "", type: "Date" },

  { name: "productIds", value: "", type: "String" },

  { name: "format", value: "", type: "Enum" },

  { name: "status", value: "", type: "Enum" },
];

const ReportrequestSchema = zod.object({
  reportType: zod.string().min(1, { message: "reportType is required" }),

  storeIds: zod.string().min(1, { message: "storeIds is required" }),

  dateFrom: zod.string().min(1, { message: "dateFrom is required" }),

  dateTo: zod.string().min(1, { message: "dateTo is required" }),

  productIds: zod.string().nullable(),

  format: zod.string().min(1, { message: "format is required" }),

  status: zod.string().min(1, { message: "status is required" }),
});

export default function ReportingCreateReportRequestModal({ openDialog }) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const defaultValues = {
    reportType: "",

    storeIds: "",

    dateFrom: "",

    dateTo: "",

    productIds: "",

    format: "",

    status: "",
  };

  const methods = useForm({
    resolver: zodResolver(ReportrequestSchema),
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
      const response = await reportingAxios.post(
        reportingEndpoints.reportRequest.createReportRequest,
        data,
      );
      setError(null);
      reset();
      console.info("RESPONSE", response);
      await mutate([reportingEndpoints.reportRequest.listReportRequests]);
      openDialog.onFalse();
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Create ReportRequest</DialogTitle>

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
                : "An error occurred while creating the reportRequest."}
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
