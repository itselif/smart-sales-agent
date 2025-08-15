import { varAlpha, mergeClasses } from "minimal-shared/utils";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import { Logo } from "src/components/logo";
import { Scrollbar } from "src/components/scrollbar";
import {
  NavSectionData,
  NavSectionMini,
  NavSectionVertical,
} from "src/components/nav-section";

import { layoutClasses } from "../core/classes";
import { NavUser } from "../components/nav-user";
import { NavToggleButton } from "../components/nav-toggle-button";

// ----------------------------------------------------------------------

export function NavVertical({
  sx,
  data,
  slots,
  cssVars,
  className,
  navLayout,
  onToggleNav,
  layoutQuery = "md",
  ...other
}) {
  const isNavMini = navLayout === "mini";
  const isNavData = navLayout === "dataObject";

  const renderNavFilter = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionData cssVars={cssVars} sx={{ px: 2, flex: "1 1 auto" }} />
      </Scrollbar>
    </>
  );

  const renderNavVertical = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          cssVars={cssVars}
          sx={{ px: 2, flex: "1 1 auto" }}
        />
      </Scrollbar>
    </>
  );

  const renderNavMini = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2.5 }}>
          <Logo />
        </Box>
      )}

      <NavSectionMini
        data={data}
        cssVars={cssVars}
        sx={[
          (theme) => ({
            ...theme.mixins.hideScrollY,
            pb: 2,
            px: 0.5,
            flex: "1 1 auto",
            overflowY: "auto",
          }),
        ]}
      />
    </>
  );

  return (
    <NavRoot
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([
        layoutClasses.nav.root,
        layoutClasses.nav.vertical,
        className,
      ])}
      sx={sx}
      {...other}
    >
      {isNavData ? (
        renderNavFilter()
      ) : (
        <>
          <NavToggleButton
            isNavMini={isNavMini}
            onClick={onToggleNav}
            sx={[
              (theme) => ({
                display: "none",
                [theme.breakpoints.up(layoutQuery)]: { display: "inline-flex" },
              }),
            ]}
          />
          {isNavMini ? renderNavMini() : renderNavVertical()}
        </>
      )}
      <NavUser
        cssVars={cssVars}
        sx={{ px: 2, flex: "1 1 auto", mb: ".7rem" }}
      />
    </NavRoot>
  );
}

// ----------------------------------------------------------------------

const NavRoot = styled("div", {
  shouldForwardProp: (prop) =>
    !["isNavMini", "layoutQuery", "sx"].includes(prop),
})(({ isNavMini, layoutQuery = "md", theme }) => ({
  top: 0,
  left: 0,
  height: "100%",
  display: "none",
  position: "fixed",
  flexDirection: "column",
  zIndex: "var(--layout-nav-zIndex)",
  backgroundColor: "var(--layout-nav-bg)",
  width: isNavMini
    ? "var(--layout-nav-mini-width)"
    : "var(--layout-nav-vertical-width)",
  borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey["500Channel"], 0.12)})`,
  transition: theme.transitions.create(["width"], {
    easing: "var(--layout-transition-easing)",
    duration: "var(--layout-transition-duration)",
  }),
  [theme.breakpoints.up(layoutQuery)]: { display: "flex" },
}));
