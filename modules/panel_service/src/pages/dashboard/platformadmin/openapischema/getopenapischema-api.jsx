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

import { usePlatformAdminGetOpenApiSchema } from "src/actions/platformAdmin";

import { JsonResponse } from "../../../../components/json-response";
import { TableResponse } from "../../../../components/table-response";

export default function PlatformAdminGetOpenApiSchemaApiPage() {
  const [view, setView] = useState("Table");

  const [inputOpenApiSchemaId, setInputOpenApiSchemaId] = useState("");
  const [submittedOpenApiSchemaId, setSubmittedOpenApiSchemaId] =
    useState(null);

  const { openapischema, openapischemaLoading, openapischemaError } =
    usePlatformAdminGetOpenApiSchema(submittedOpenApiSchemaId);

  const handleGetOpenapischema = () => {
    setSubmittedOpenApiSchemaId(inputOpenApiSchemaId);
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
              label="openApiSchemaId"
              value={inputOpenApiSchemaId}
              onChange={(e) => setInputOpenApiSchemaId(e.target.value)}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={handleGetOpenapischema}
            disabled={!inputOpenApiSchemaId || openapischemaLoading}
          >
            GET
          </Button>
        </Box>
      </Box>

      <Divider />

      {!openapischemaLoading && (openapischemaError || openapischema) && (
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
                color={openapischemaError ? "error" : "success"}
                display="inline"
              >
                {openapischemaError ? openapischemaError.status : "200"}
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
                content={openapischema}
                error={openapischemaError}
              />
            ) : (
              <JsonResponse content={openapischema || openapischemaError} />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
