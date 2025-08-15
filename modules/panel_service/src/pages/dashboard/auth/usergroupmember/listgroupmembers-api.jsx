import { useState } from "react";
import { useDebounce } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import {
  Chip,
  Paper,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from "@mui/material";

import { useAuthListGroupMembers } from "src/actions/auth";

export default function AuthListGroupMembersApiPage() {
  const theme = useTheme();

  const [inputGroupId, setInputGroupId] = useState("");
  const [submittedGroupId, setSubmittedGroupId] = useState(null);

  const debouncedInputGroupId = useDebounce(inputGroupId);

  const { searchResults: options, searchLoading: loading } =
    useAuthListGroupMembers({
      groupId: debouncedInputGroupId,
    });

  return (
    <>
      <Box marginY="2rem">
        <Box display="flex" flexDirection="row" gap={3} marginBottom="1.5rem">
          <Typography variant="h4">UserGroupMembers</Typography>
          <Chip
            variant="contained"
            label="List"
            sx={{
              backgroundColor: "black",
              color: "white",
              borderRadius: "5px",
            }}
          />
        </Box>

        <Box component="div" gap="1rem" display="flex">
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
                <TableRow key="groupId">
                  <TableCell sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <Chip variant="soft" label="groupId" />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="outlined"
                      fullWidth
                      label="groupId"
                      value={inputGroupId}
                      onChange={(e) => setInputGroupId(e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <Divider />

      {!loading && options && options.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(options[0]).map((key) => (
                  <TableCell key={key}>
                    <Typography variant="body1" fontWeight="bold">
                      {key}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {options.map((row, index) => (
                <TableRow key={index}>
                  {Object.keys(row).map((key) => (
                    <TableCell key={key}>
                      <span style={{ whiteSpace: "noWrap" }}>{row[key]}</span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
