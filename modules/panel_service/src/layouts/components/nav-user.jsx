import { useRef } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { mergeClasses } from "minimal-shared/utils";

import { Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useRouter } from "../../routes/hooks";
import { signOut } from "../../auth/context/jwt/index.js";
import { useAuthContext } from "../../auth/hooks/index.js";
import { NavItem } from "../../components/nav-section/vertical/nav-item.jsx";
import {
  Nav,
  NavLi,
  NavUl,
  navSectionClasses,
  navSectionCssVars,
} from "../../components/nav-section/index.js";

export function NavUser({
  sx,
  className,
  slotProps,
  cssVars: overridesVars,
  ...other
}) {
  const router = useRouter();
  const { user, checkUserSession } = useAuthContext();
  const theme = useTheme();
  const navItemRef = useRef(null);

  const cssVars = { ...navSectionCssVars.vertical(theme), ...overridesVars };

  const LogoutHandler = async () => {
    try {
      await signOut();
      await checkUserSession?.();

      onclose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to logout!");
    }
  };

  const renderAvatar = () =>
    user.avatar ? (
      <Avatar alt={user.fullname} src={user.avatar} />
    ) : (
      <Avatar alt={user.fullname}>
        {user.fullname.charAt(0).toUpperCase()}
      </Avatar>
    );

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
            title={user.fullname}
            depth={1}
            slotProps={slotProps?.rootItem}
            onClick={(e) => e.preventDefault()}
            icon={renderAvatar()}
          />
        </NavLi>
        <NavLi sx={slotProps}>
          <NavItem
            ref={navItemRef}
            title="Logout"
            depth={1}
            slotProps={slotProps?.rootItem}
            onClick={LogoutHandler}
            icon={<Icon icon="basil:logout-solid" width="20" height="20" />}
          />
        </NavLi>
      </NavUl>
    </Nav>
  );
}
