import * as zod from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Chip,
  Link,
  Table,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  ToggleButton,
  TableContainer,
  ToggleButtonGroup,
} from "@mui/material";

import { Form, Field } from "../../../../components/hook-form";
import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";
import reportingAxios, {
  reportingEndpoints,
} from "../../../../lib/reporting-axios.js";

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

export default function ReportingCreateReportRequestApiPage() {
  const [view, setView] = useState("Table");
  const [createdReportrequest, setCreatedReportrequest] = useState(null);
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

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await reportingAxios.post(
        reportingEndpoints.reportRequest.createReportRequest,
        data,
      );
      setError(null);
      setCreatedReportrequest(null);
      reset();
      console.info("RESPONSE", response);
      setCreatedReportrequest(response.data.reportrequest);
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Box marginY="2rem">
        <Typography variant="h4" marginBottom="1.5rem">
          CREATE
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="30%">
                  <Typography variant="body1" fontWeight="bold">
                    Property Name
                  </Typography>
                </TableCell>
                <TableCell width="70%">
                  <Typography variant="body1" fontWeight="bold">
                    Property Value
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requestParams.map((row) => (
                <TableRow key={row.name}>
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100] }}>
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
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Link component="button" underline="always" onClick={() => reset()}>
            Cancel
          </Link>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting}
          >
            Save
          </LoadingButton>
        </Box>
      </Box>
      <Divider />
      {(createdReportrequest || error) && (
        <Box paddingTop="2rem">
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1">
              STATUS:{" "}
              <Typography
                component="span"
                variant="subtitle1"
                color={error ? "error" : "success"}
                display="inline"
              >
                {error ? (error.status ?? "500") : "201"}
              </Typography>
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <ToggleButtonGroup
                color="standard"
                value={view}
                exclusive
                onChange={(_, val) => val && setView(val)}
              >
                <ToggleButton value="Table" sx={{ paddingX: "2rem" }}>
                  Table
                </ToggleButton>
                <ToggleButton value="JSON" sx={{ paddingX: "2rem" }}>
                  JSON
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          <Box>
            {view === "Table" ? (
              <TableResponse content={createdReportrequest} error={error} />
            ) : (
              <JsonResponse content={createdReportrequest || error} />
            )}
          </Box>
        </Box>
      )}
    </Form>
  );
}
