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
import salesManagementAxios, {
  salesManagementEndpoints,
} from "../../../../lib/salesManagement-axios.js";

const requestParams = [
  { name: "transactionId", value: "", type: "ID" },

  { name: "changeType", value: "", type: "Enum" },

  { name: "changedByUserId", value: "", type: "ID" },

  { name: "changeTimestamp", value: "", type: "Date" },

  { name: "correctionJustification", value: "", type: "Text" },

  { name: "previousData", value: "", type: "Object" },

  { name: "newData", value: "", type: "Object" },
];

const SaletransactionhistorySchema = zod.object({
  transactionId: zod.string().min(1, { message: "transactionId is required" }),

  changeType: zod.string().min(1, { message: "changeType is required" }),

  changedByUserId: zod
    .string()
    .min(1, { message: "changedByUserId is required" }),

  changeTimestamp: zod
    .string()
    .min(1, { message: "changeTimestamp is required" }),

  correctionJustification: zod.string().nullable(),

  previousData: zod.string().min(1, { message: "previousData is required" }),

  newData: zod.string().nullable(),
});

export default function SalesManagementCreateSaleTransactionHistoryApiPage() {
  const [view, setView] = useState("Table");
  const [createdSaletransactionhistory, setCreatedSaletransactionhistory] =
    useState(null);
  const [error, setError] = useState(null);

  const theme = useTheme();

  const defaultValues = {
    transactionId: "",

    changeType: "",

    changedByUserId: "",

    changeTimestamp: "",

    correctionJustification: "",

    previousData: "",

    newData: "",
  };

  const methods = useForm({
    resolver: zodResolver(SaletransactionhistorySchema),
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
      const response = await salesManagementAxios.post(
        salesManagementEndpoints.saleTransactionHistory
          .createSaleTransactionHistory,
        data,
      );
      setError(null);
      setCreatedSaletransactionhistory(null);
      reset();
      console.info("RESPONSE", response);
      setCreatedSaletransactionhistory(response.data.saletransactionhistory);
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
      {(createdSaletransactionhistory || error) && (
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
              <TableResponse
                content={createdSaletransactionhistory}
                error={error}
              />
            ) : (
              <JsonResponse content={createdSaletransactionhistory || error} />
            )}
          </Box>
        </Box>
      )}
    </Form>
  );
}
