import { z as zod } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useBoolean } from "minimal-shared/hooks";
import { zodResolver } from "@hookform/resolvers/zod";

import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";

import { useRouter } from "src/routes/hooks";

import { Iconify } from "src/components/iconify";
import { Form, Field } from "src/components/hook-form";
import { AnimateLogoRotate } from "src/components/animate";

import { useAuthContext } from "../hooks";
import { getErrorMessage } from "../utils";
import { signInWithPassword } from "../context/jwt";
import { FormHead } from "../components/form-head.jsx";

export const LoginSchema = zod.object({
  username: zod.string().min(1, { message: "User name is required!" }),
  password: zod.string().min(1, { message: "Password is required!" }),
});

export function LoginView() {
  const router = useRouter();

  const showPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState("");

  const defaultValues = {
    username: "",
    password: "",
  };

  const methods = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({
        username: data.username,
        password: data.password,
      });
      await checkUserSession?.();

      router.refresh();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
      <Field.Text
        name="username"
        label="User name"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Box sx={{ gap: 1.5, display: "flex", flexDirection: "column" }}>
        <Field.Text
          name="password"
          label="Password"
          type={showPassword.value ? "text" : "password"}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={
                        showPassword.value
                          ? "solar:eye-bold"
                          : "solar:eye-closed-bold"
                      }
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sign in..."
      >
        Sign in
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <AnimateLogoRotate sx={{ mb: 3, mx: "auto" }} />

      <FormHead title="Sign in to your account" description="Mındbrıcks" />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
