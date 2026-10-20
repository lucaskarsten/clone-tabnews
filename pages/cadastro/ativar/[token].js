import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { Flash, Link, Text } from "@primer/react";
import DefaultLayout from "components/DefaultLayout.js";

export default function Ativar() {
  const router = useRouter();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;

    async function activate() {
      const response = await fetch(
        `/api/v1/activations/${router.query.token}`,
        { method: "PATCH" },
      );
      setResult({ ok: response.ok, body: await response.json() });
    }

    activate();
  }, [router.isReady, router.query.token]);

  return (
    <DefaultLayout title="Ativação de conta">
      {!result && <Text as="p">Ativando sua conta...</Text>}
      {result?.ok && (
        <Flash variant="success">
          Conta ativada! Agora você já pode{" "}
          <Link as={NextLink} href="/login">
            fazer login
          </Link>
          .
        </Flash>
      )}
      {result && !result.ok && (
        <Flash variant="danger">
          {result.body.message} {result.body.action}
        </Flash>
      )}
    </DefaultLayout>
  );
}
