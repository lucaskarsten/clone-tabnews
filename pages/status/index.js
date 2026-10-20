import useSWR from "swr";
import { Text } from "@primer/react";
import DefaultLayout from "components/DefaultLayout.js";

async function fetchAPI(key) {
  const response = await fetch(key);
  return response.json();
}

export default function StatusPage() {
  const { data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (!data) {
    return (
      <DefaultLayout title="Status">
        <Text as="p">Carregando...</Text>
      </DefaultLayout>
    );
  }

  const database = data.dependencies.database;

  return (
    <DefaultLayout title="Status">
      <Text as="p">
        Última atualização: {new Date(data.updated_at).toLocaleString("pt-BR")}
      </Text>
      <Text as="h2" sx={{ fontSize: 3, mt: 4, mb: 2 }}>
        Banco de dados
      </Text>
      <ul>
        {database.version && <li>Versão: {database.version}</li>}
        <li>Conexões abertas: {database.open_connection}</li>
        <li>Conexões máximas: {database.max_connections}</li>
      </ul>
    </DefaultLayout>
  );
}
