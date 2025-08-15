import Divider from "@mui/material/Divider";

import { useDataObjectContext } from "../nav-section/data/context/index.js";
import Box from "@mui/material/Box";

export function DataObjectListNotProvided() {
  const { state } = useDataObjectContext();
  return (
    <>
      <h2>{state.name} List Endpoint Not Provided</h2>
      <Divider />
      <Box component="p">
        To use this component, please create a list endpoint named{" "}
        <strong>{state.defaultListRouteName}</strong> for this data object in
        project panel.
      </Box>
    </>
  );
}
