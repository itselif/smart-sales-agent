import { NavLi } from "./nav-elements.jsx";
import { Label } from "../../label/index.js";
import { NavItem } from "../vertical/nav-item.jsx";
import { useDataObjectContext } from "../data/context/index.js";

export function NavApi({ slotProps, navItemRef }) {
  const { state, setField } = useDataObjectContext();

  return state.cruds.map((crud, index) => (
    <NavLi sx={slotProps} key={index}>
      <NavItem
        ref={navItemRef}
        title={crud.name}
        active={state.selectedApi === crud.componentName}
        depth={1}
        slotProps={slotProps?.rootItem}
        onClick={(e) => {
          e.preventDefault();
          setField("selectedApi", crud.componentName);
          setField("selectedApiName", crud.name);
        }}
        info={
          <Label color={crud.color} variant="soft">
            {crud.method}
          </Label>
        }
      />
    </NavLi>
  ));
}
