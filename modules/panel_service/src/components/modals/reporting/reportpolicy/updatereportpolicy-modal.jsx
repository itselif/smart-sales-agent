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

import reportingAxios, {
  reportingEndpoints,
} from "../../../../lib/reporting-axios.js";

const UPDATE_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const ReportpolicySchema = zod.object({
  maxRetentionDays: zod.number().nullable(),

  allowedFormats: zod.string().nullable(),

  description: zod.string().nullable(),
});

export default function ReportingUpdateReportPolicyModal({
  openDialog,
  selectedReportPolicy,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const requestParams = [
    {
      name: "maxRetentionDays",
      value: selectedReportPolicy?.maxRetentionDays ?? "",
      type: "Integer",
    },

    {
      name: "allowedFormats",
      value: selectedReportPolicy?.allowedFormats ?? "",
      type: "Enum",
    },

    {
      name: "description",
      value: selectedReportPolicy?.description ?? "",
      type: "Text",
    },
  ];

  const defaultValues = {
    maxRetentionDays: selectedReportPolicy?.maxRetentionDays ?? "",

    allowedFormats: selectedReportPolicy?.allowedFormats ?? "",

    description: selectedReportPolicy?.description ?? "",
  };

  const methods = useForm({
    resolver: zodResolver(ReportpolicySchema),
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
      if (selectedReportPolicy?.id) {
        const response = await reportingAxios.patch(
          reportingEndpoints.reportPolicy.updateReportPolicy.replace(
            ":reportPolicyId",
            selectedReportPolicy?.id,
          ),
          data,
        );
        setError(null);
        reset();
        console.info("RESPONSE", response);
        await mutate([reportingEndpoints.reportPolicy.listReportPolicies]);
        openDialog.onFalse();
      }
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  useEffect(() => {
    methods.reset({
      maxRetentionDays: selectedReportPolicy?.maxRetentionDays ?? "",

      allowedFormats: selectedReportPolicy?.allowedFormats ?? "",

      description: selectedReportPolicy?.description ?? "",
    });
  }, [selectedReportPolicy]);

  if (!selectedReportPolicy) return null;

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Update ReportPolicy</DialogTitle>

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
                : "An error occurred while creating the reportPolicy."}
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
