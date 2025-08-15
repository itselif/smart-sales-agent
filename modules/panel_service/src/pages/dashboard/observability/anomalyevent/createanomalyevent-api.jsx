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
import observabilityAxios, {
  observabilityEndpoints,
} from "../../../../lib/observability-axios.js";

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

export default function ObservabilityCreateAnomalyEventApiPage() {
  const [view, setView] = useState("Table");
  const [createdAnomalyevent, setCreatedAnomalyevent] = useState(null);
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

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await observabilityAxios.post(
        observabilityEndpoints.anomalyEvent.createAnomalyEvent,
        data,
      );
      setError(null);
      setCreatedAnomalyevent(null);
      reset();
      console.info("RESPONSE", response);
      setCreatedAnomalyevent(response.data.anomalyevent);
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
      {(createdAnomalyevent || error) && (
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
              <TableResponse content={createdAnomalyevent} error={error} />
            ) : (
              <JsonResponse content={createdAnomalyevent || error} />
            )}
          </Box>
        </Box>
      )}
    </Form>
  );
}
