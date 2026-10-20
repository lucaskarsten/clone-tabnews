import DefaultLayout from "components/DefaultLayout.js";
import CredentialsForm, { Field } from "components/CredentialsForm.js";

export default function Cadastro() {
  return (
    <DefaultLayout title="Cadastro" description="Crie sua conta.">
      <CredentialsForm
        endpoint="/api/v1/users"
        successStatus={201}
        redirectTo="/cadastro/confirmar"
        submitLabel="Criar cadastro"
      >
        <Field label="Nome de usuário" name="username" maxLength={30} />
        <Field label="Email" name="email" type="email" />
        <Field label="Senha" name="password" type="password" />
      </CredentialsForm>
    </DefaultLayout>
  );
}
