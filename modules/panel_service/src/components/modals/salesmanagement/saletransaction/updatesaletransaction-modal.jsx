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

import salesManagementAxios, {
  salesManagementEndpoints,
} from "../../../../lib/salesManagement-axios.js";

const UPDATE_TABLE_HEAD = [
  { id: "propertyName", label: "Property Name", width: "30%" },
  { id: "propertyValue", label: "Property Value", width: "70%" },
];

const SaletransactionSchema = zod.object({
  amount: zod.number().nullable(),

  currency: zod.string().nullable(),

  status: zod.string().nullable(),

  correctionJustification: zod.string().nullable(),
});

export default function SalesManagementUpdateSaleTransactionModal({
  openDialog,
  selectedSaleTransaction,
}) {
  const [error, setError] = useState(null);

  const theme = useTheme();

  const requestParams = [
    {
      name: "amount",
      value: selectedSaleTransaction?.amount ?? "",
      type: "Double",
    },

    {
      name: "currency",
      value: selectedSaleTransaction?.currency ?? "",
      type: "String",
    },

    {
      name: "status",
      value: selectedSaleTransaction?.status ?? "",
      type: "Enum",
    },

    {
      name: "correctionJustification",
      value: selectedSaleTransaction?.correctionJustification ?? "",
      type: "Text",
    },
  ];

  const defaultValues = {
    amount: selectedSaleTransaction?.amount ?? "",

    currency: selectedSaleTransaction?.currency ?? "",

    status: selectedSaleTransaction?.status ?? "",

    correctionJustification:
      selectedSaleTransaction?.correctionJustification ?? "",
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
      if (selectedSaleTransaction?.id) {
        const response = await salesManagementAxios.patch(
          salesManagementEndpoints.saleTransaction.updateSaleTransaction.replace(
            ":saleTransactionId",
            selectedSaleTransaction?.id,
          ),
          data,
        );
        setError(null);
        reset();
        console.info("RESPONSE", response);
        await mutate([
          salesManagementEndpoints.saleTransaction.listSaleTransactions,
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
      amount: selectedSaleTransaction?.amount ?? "",

      currency: selectedSaleTransaction?.currency ?? "",

      status: selectedSaleTransaction?.status ?? "",

      correctionJustification:
        selectedSaleTransaction?.correctionJustification ?? "",
    });
  }, [selectedSaleTransaction]);

  if (!selectedSaleTransaction) return null;

  return (
    <Dialog open={openDialog.value} maxWidth="md">
      <DialogTitle>Update SaleTransaction</DialogTitle>

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
