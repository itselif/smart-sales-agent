import { merge } from "es-toolkit";
import { Link, useLocation } from "react-router";
import { useBoolean } from "minimal-shared/hooks";

import { Breadcrumbs } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { useSettingsContext } from "src/components/settings";

import { NavMobile } from "./nav-mobile";
import { NavVertical } from "./nav-vertical";
import { layoutClasses } from "../core/classes";
import { MainSection } from "../core/main-section";
import { MenuButton } from "../components/menu-button";
import { HeaderSection } from "../core/header-section";
import { LayoutSection } from "../core/layout-section";
import { navData as dashboardNavData } from "../nav-config-dashboard";
import { dashboardLayoutVars, dashboardNavColorVars } from "./css-vars";
import { useDataObjectContext } from "../../components/nav-section/data/context/index.js";

// ----------------------------------------------------------------------

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = "lg",
}) {
  const theme = useTheme();
  const location = useLocation();
  const { state } = useDataObjectContext();

  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(
    theme,
    settings.state.navColor,
    settings.state.navLayout,
  );

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const path = location.pathname.replace(/\/+$/, "");
  const isDashboardRoot = path === "/dashboard";

  const navData = slotProps?.nav?.data ?? dashboardNavData;

  const isNavMini = settings.state.navLayout === "mini";

  const renderHeader = () => {
    const headerSlotProps = {
      container: {
        maxWidth: false,
        sx: {
          px: { [layoutQuery]: 5 },
        },
      },
    };

    const headerSlots = {
      bottomArea: null,
      leftArea: (
        <>
          <MenuButton
            onClick={onOpen}
            sx={{
              mr: 1,
              ml: -1,
              [theme.breakpoints.up(layoutQuery)]: { display: "none" },
            }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section}
          />
          <Breadcrumbs>
            <Link to="/" color="inherit" href="/">
              Admin Panel
            </Link>
            {!isDashboardRoot && state.name && (
              <Typography sx={{ color: "text.primary" }}>
                {state.name}
              </Typography>
            )}
            {!isDashboardRoot && state?.display === "List" && (
              <Typography sx={{ color: "text.primary" }}>List</Typography>
            )}
            {!isDashboardRoot && state?.display === "API" && (
              <Typography sx={{ color: "text.primary" }}>API</Typography>
            )}
            {!isDashboardRoot &&
              state?.display === "API" &&
              state.selectedApiName && (
                <Typography sx={{ color: "text.primary" }}>
                  {state.selectedApiName}
                </Typography>
              )}
          </Breadcrumbs>
        </>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation="true"
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      navLayout={settings.state.navLayout}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      onToggleNav={() =>
        settings.setField(
          "navLayout",
          settings.state.navLayout === "vertical" ? "mini" : "vertical",
        )
      }
    />
  );

  const renderMain = () => (
    <MainSection {...slotProps?.main}>{children}</MainSection>
  );

  return (
    <LayoutSection
      headerSection={renderHeader()}
      sidebarSection={renderSidebar()}
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini
                ? "var(--layout-nav-mini-width)"
                : "var(--layout-nav-vertical-width)",
              transition: theme.transitions.create(["padding-left"], {
                easing: "var(--layout-transition-easing)",
                duration: "var(--layout-transition-duration)",
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
