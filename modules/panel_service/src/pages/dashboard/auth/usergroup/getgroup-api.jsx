import { useState } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import {
  Button,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { useAuthGetGroup } from "src/actions/auth";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function AuthGetGroupApiPage() {
  const [view, setView] = useState("Table");

  const [inputUserGroupId, setInputUserGroupId] = useState("");
  const [submittedUserGroupId, setSubmittedUserGroupId] = useState(null);

  const { group, groupLoading, groupError } =
    useAuthGetGroup(submittedUserGroupId);

  const handleGetGroup = () => {
    setSubmittedUserGroupId(inputUserGroupId);
  };

  return (
    <>
      <Box marginY="2rem">
        <Typography variant="h4" marginBottom="1.5rem">
          GET
        </Typography>

        <Box component="div" gap="1rem" display="flex" key="0">
          <Box minWidth="35%">
            <TextField
              size="small"
              variant="outlined"
              fullWidth
              label="userGroupId"
              value={inputUserGroupId}
              onChange={(e) => setInputUserGroupId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetGroup}
            disabled={!inputUserGroupId || groupLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!groupLoading && (groupError || group) && (
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
                color={groupError ? "error" : "success"}
                display="inline"
              >
                {groupError ? groupError.status : "200"}
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
              <TableResponse content={group} error={groupError} />
            ) : (
              <JsonResponse content={group || groupError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
