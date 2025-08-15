import { chip } from "./chip";
import { link } from "./link";
import { paper } from "./paper";
import { table } from "./table";
import { button } from "./button";
import { dialog } from "./dialog";
import { avatar } from "./avatar";
import { backdrop } from "./backdrop";
import { checkbox } from "./checkbox";
import { textfield } from "./textfield";
import { typography } from "./typography";
import { breadcrumbs } from "./breadcrumbs";
import { dataGrid } from "./mui-x-data-grid";
import { toggleButton } from "./button-toggle";

// ----------------------------------------------------------------------

export const components = {
  ...button,
  ...toggleButton,
  ...link,
  ...chip,
  ...paper,
  ...dataGrid,
  ...dialog,
  ...avatar,
  ...table,
  ...textfield,
  ...typography,
  ...backdrop,
  ...checkbox,
  ...breadcrumbs,
};
