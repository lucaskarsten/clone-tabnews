import NextLink from "next/link";
import { Link, Text } from "@primer/react";
import DefaultLayout from "components/DefaultLayout.js";

export default function Home() {
  return (
    <DefaultLayout title="Início">
      <Text as="p" sx={{ mb: 3 }}>
        Clone do TabNews construído ao longo do curso.dev.
      </Text>
      <ul>
        <li>
          <Link as={NextLink} href="/cadastro">
            Criar conta
          </Link>
        </li>
        <li>
          <Link as={NextLink} href="/login">
            Entrar
          </Link>
        </li>
        <li>
          <Link as={NextLink} href="/status">
            Status do sistema
          </Link>
        </li>
      </ul>
    </DefaultLayout>
  );
}
