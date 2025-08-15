import { forwardRef } from "react";

import { Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { Scrollbar } from "../scrollbar/index.js";

export const JsonResponse = forwardRef((props, ref) => {
  const { content } = props;
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 2,
        fontFamily: "monospace",
        whiteSpace: "pre",
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[300]}`,
      }}
    >
      {content && <Scrollbar>{JSON.stringify(content, null, 2)}</Scrollbar>}
    </Paper>
  );
});
