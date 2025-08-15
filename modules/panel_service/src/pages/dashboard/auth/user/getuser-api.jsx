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

import { useAuthGetUser } from "src/actions/auth";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function AuthGetUserApiPage() {
  const [view, setView] = useState("Table");

  const [inputUserId, setInputUserId] = useState("");
  const [submittedUserId, setSubmittedUserId] = useState(null);

  const { user, userLoading, userError } = useAuthGetUser(submittedUserId);

  const handleGetUser = () => {
    setSubmittedUserId(inputUserId);
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
              label="userId"
              value={inputUserId}
              onChange={(e) => setInputUserId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetUser}
            disabled={!inputUserId || userLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!userLoading && (userError || user) && (
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
                color={userError ? "error" : "success"}
                display="inline"
              >
                {userError ? userError.status : "200"}
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
              <TableResponse content={user} error={userError} />
            ) : (
              <JsonResponse content={user || userError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
