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
  { name: "userId", value: "", type: "ID" },

  { name: "actionType", value: "", type: "String" },

  { name: "entityType", value: "", type: "String" },

  { name: "entityId", value: "", type: "String" },

  { name: "beforeData", value: "", type: "Object" },

  { name: "afterData", value: "", type: "Object" },

  { name: "severity", value: "", type: "Enum" },

  { name: "message", value: "", type: "Text" },

  { name: "traceContext", value: "", type: "Object" },
];

const AuditlogSchema = zod.object({
  userId: zod.string().min(1, { message: "userId is required" }),

  actionType: zod.string().min(1, { message: "actionType is required" }),

  entityType: zod.string().nullable(),

  entityId: zod.string().nullable(),

  beforeData: zod.string().nullable(),

  afterData: zod.string().nullable(),

  severity: zod.string().min(1, { message: "severity is required" }),

  message: zod.string().nullable(),

  traceContext: zod.string().nullable(),
});

export default function ObservabilityCreateAuditLogModal({ openDialog }) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const defaultValues = {
    userId: "",

    actionType: "",

    entityType: "",

    entityId: "",

    beforeData: "",

    afterData: "",

    severity: "",

    message: "",

    traceContext: "",
  };

  const methods = useForm({
    resolver: zodResolver(AuditlogSchema),
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
        observabilityEndpoints.auditLog.createAuditLog,
        data,
      );
      setError(null);
      reset();
      console.info("RESPONSE", response);
      await mutate([observabilityEndpoints.auditLog.listAuditLogs]);
      openDialog.onFalse();
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Create AuditLog</DialogTitle>

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
                : "An error occurred while creating the auditLog."}
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
