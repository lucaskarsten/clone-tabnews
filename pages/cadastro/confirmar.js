import { Flash, Text } from "@primer/react";
import DefaultLayout from "components/DefaultLayout.js";

export default function Confirmar() {
  return (
    <DefaultLayout title="Confira seu email">
      <Flash variant="success" sx={{ mb: 3 }}>
        Cadastro recebido!
      </Flash>
      <Text as="p">
        Enviamos um link de ativação para o seu email. Clique nele em até 15
        minutos para ativar sua conta.
      </Text>
    </DefaultLayout>
  );
}
