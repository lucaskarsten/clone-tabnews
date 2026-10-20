import { BaseStyles, ThemeProvider } from "@primer/react";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider colorMode="auto">
      <BaseStyles>
        <Component {...pageProps} />
      </BaseStyles>
    </ThemeProvider>
  );
}
