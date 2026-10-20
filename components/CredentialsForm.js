import { useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, Flash, FormControl, TextInput } from "@primer/react";

// Formulário compartilhado por /cadastro e /login: envia os campos como JSON
// e mostra a mensagem de erro que o back-end devolver.
export default function CredentialsForm({
  endpoint,
  successStatus,
  redirectTo,
  submitLabel,
  children,
}) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = new FormData(event.target);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });

    if (response.status === successStatus) {
      router.push(redirectTo);
      return;
    }

    setError(await response.json());
    setIsLoading(false);
  }

  return (
    <>
      {error && (
        <Flash variant="danger" sx={{ mb: 3 }}>
          {error.message} {error.action}
        </Flash>
      )}
      <Box
        as="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {children}
        <Button type="submit" variant="primary" disabled={isLoading}>
          {submitLabel}
        </Button>
      </Box>
    </>
  );
}

export function Field({ label, name, type = "text", ...props }) {
  return (
    <FormControl required>
      <FormControl.Label>{label}</FormControl.Label>
      <TextInput name={name} type={type} block {...props} />
    </FormControl>
  );
}
