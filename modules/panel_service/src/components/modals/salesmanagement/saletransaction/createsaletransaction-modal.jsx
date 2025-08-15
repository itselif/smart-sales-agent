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

import salesManagementAxios, {
  salesManagementEndpoints,
} from "../../../../lib/salesManagement-axios.js";

const ADD_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const requestParams = [
  { name: "amount", value: "", type: "Double" },

  { name: "currency", value: "", type: "String" },

  { name: "transactionDate", value: "", type: "Date" },

  { name: "status", value: "", type: "Enum" },

  { name: "correctionJustification", value: "", type: "Text" },
];

const SaletransactionSchema = zod.object({
  amount: zod.number().min(1, { message: "amount is required" }),

  currency: zod.string().min(1, { message: "currency is required" }),

  transactionDate: zod
    .string()
    .min(1, { message: "transactionDate is required" }),

  status: zod.string().min(1, { message: "status is required" }),

  correctionJustification: zod.string().nullable(),
});

export default function SalesManagementCreateSaleTransactionModal({
  openDialog,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const defaultValues = {
    amount: "",

    currency: "",

    transactionDate: "",

    status: "",

    correctionJustification: "",
  };

  const methods = useForm({
    resolver: zodResolver(SaletransactionSchema),
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
      const response = await salesManagementAxios.post(
        salesManagementEndpoints.saleTransaction.createSaleTransaction,
        data,
      );
      setError(null);
      reset();
      console.info("RESPONSE", response);
      await mutate([
        salesManagementEndpoints.saleTransaction.listSaleTransactions,
      ]);
      openDialog.onFalse();
    } catch (ex) {
      console.error(ex);
      setError(ex);
    }
  });

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Create SaleTransaction</DialogTitle>

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
                : "An error occurred while creating the saleTransaction."}
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
