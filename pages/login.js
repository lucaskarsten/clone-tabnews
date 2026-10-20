import DefaultLayout from "components/DefaultLayout.js";
import CredentialsForm, { Field } from "components/CredentialsForm.js";

export default function Login() {
  return (
    <DefaultLayout title="Login" description="Entre na sua conta.">
      <CredentialsForm
        endpoint="/api/v1/sessions"
        successStatus={201}
        redirectTo="/"
        submitLabel="Entrar"
      >
        <Field label="Email" name="email" type="email" />
        <Field label="Senha" name="password" type="password" />
      </CredentialsForm>
    </DefaultLayout>
  );
}
