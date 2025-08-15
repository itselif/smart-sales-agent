import { Helmet } from "react-helmet-async";

import { CONFIG } from "src/global-config";

import { LoginView } from "src/auth/view";

const metadata = { title: `Login - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <LoginView />
    </>
  );
}
