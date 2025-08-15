import { useRef } from "react";
import { Icon } from "@iconify/react";
import { mergeClasses } from "minimal-shared/utils";

import { useTheme } from "@mui/material/styles";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { NavItem } from "../vertical/nav-item";
import { paths } from "../../../routes/paths.js";
import { useDataObjectContext } from "./context";
import { Nav, NavLi, NavUl } from "../components";
import { NavApi } from "../components/nav-api.jsx";
import { navSectionClasses, navSectionCssVars } from "../styles";

export function NavSectionData({
  sx,
  className,
  slotProps,
  cssVars: overridesVars,
  ...other
}) {
  const theme = useTheme();
  const navItemRef = useRef(null);
  const { setField, state } = useDataObjectContext();

  const cssVars = { ...navSectionCssVars.vertical(theme), ...overridesVars };

  const handleDisplay = (event, newDisplay) => {
    setField("display", newDisplay);
    setField("selectedApi", null);
    setField("selectedApiName", null);
  };

  const changeView = [
    <ToggleButton value="List" key="List">
      {state.name} List
    </ToggleButton>,
    <ToggleButton value="API" key="API">
      {state.name} API
    </ToggleButton>,
  ];

  return (
    <Nav
      className={mergeClasses([navSectionClasses.vertical, className])}
      sx={[{ ...cssVars }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <NavUl sx={{ flex: "1 1 auto", gap: "var(--nav-item-gap)" }}>
        <NavLi sx={slotProps}>
          <NavItem
            ref={navItemRef}
            icon={<Icon icon="weui:back-filled" width="12" height="24" />}
            path={paths.dashboard.root}
            title={`${state.name} Data`}
            depth={1}
            slotProps={slotProps?.rootItem}
          />
        </NavLi>
        <NavLi sx={slotProps}>
          <ToggleButtonGroup
            value={state.display}
            exclusive
            onChange={handleDisplay}
          >
            {changeView}
          </ToggleButtonGroup>
        </NavLi>
        {state.display === "API" && (
          <NavApi slotProps={slotProps} navItemRef={navItemRef} />
        )}
      </NavUl>
    </Nav>
  );
}
