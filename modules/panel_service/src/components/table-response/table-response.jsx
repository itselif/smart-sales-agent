import { forwardRef } from "react";

import { useTheme } from "@mui/material/styles";
import {
  Chip,
  Table,
  Paper,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
  TableContainer,
} from "@mui/material";

export const TableResponse = forwardRef((props, ref) => {
  let { content, error } = props;
  const theme = useTheme();

  if (error) {
    if (typeof error === "string") {
      error = {
        message: error,
      };
    }
  }

  const renderCellValue = (val) => {
    if (val === undefined || val === null)
      return <pre style={{ margin: 0 }}> </pre>;
    if (typeof val === "object")
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {Object.entries(val).map(([key, value]) => (
                <TableRow
                  key={key}
                  sx={{
                    backgroundColor: theme.palette.grey[100],
                  }}
                >
                  <TableCell>
                    <Chip variant="soft" label={key} />
                  </TableCell>
                  <TableCell>{renderCellValue(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    return <pre style={{ margin: 0 }}>{val}</pre>;
  };

  return (
    <TableContainer component={Paper}>
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
          {error &&
            Object.entries(error).map(([key, value]) => (
              <TableRow
                key={key}
                sx={{ backgroundColor: theme.palette.grey[100] }}
              >
                <TableCell>
                  <Chip variant="soft" label={key} />
                </TableCell>
                <TableCell>{renderCellValue(value)}</TableCell>
              </TableRow>
            ))}
          {content &&
            Object.entries(content).map(([key, value]) => (
              <TableRow
                key={key}
                sx={{ backgroundColor: theme.palette.grey[100] }}
              >
                <TableCell>
                  <Chip variant="soft" label={key} />
                </TableCell>
                <TableCell>{renderCellValue(value)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
