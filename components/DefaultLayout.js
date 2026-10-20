import Head from "next/head";
import NextLink from "next/link";
import { Box, Heading, Link } from "@primer/react";

export default function DefaultLayout({ title, description, children }) {
  const pageTitle = title ? `${title} · CloneTabNews` : "CloneTabNews";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta
          name="description"
          content={description || "Clone do TabNews feito no curso.dev."}
        />
      </Head>
      <Box
        as="header"
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "center",
          px: 4,
          py: 3,
          bg: "canvas.inset",
          borderBottom: "1px solid",
          borderColor: "border.default",
        }}
      >
        <Link as={NextLink} href="/" sx={{ fontWeight: "bold" }}>
          CloneTabNews
        </Link>
        <Link as={NextLink} href="/cadastro">
          Cadastro
        </Link>
        <Link as={NextLink} href="/login">
          Login
        </Link>
        <Link as={NextLink} href="/status">
          Status
        </Link>
      </Box>
      <Box as="main" sx={{ maxWidth: 480, mx: "auto", px: 3, py: 5 }}>
        {title && (
          <Heading as="h1" sx={{ mb: 4, fontSize: 4 }}>
            {title}
          </Heading>
        )}
        {children}
      </Box>
    </>
  );
}
