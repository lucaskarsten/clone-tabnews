import Head from "next/head";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <Head>
        <title>Página Pessoal - Lucas Karsten</title>
        <meta name="description" content="Página pessoal de Lucas Karsten" />
      </Head>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Bem-vindo à minha página pessoal
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Aqui você encontra links para minhas redes sociais.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <a
          href="https://www.linkedin.com/in/lucas-karsten"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 20px",
            backgroundColor: "#0077b5",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontSize: "1rem",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#005885")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#0077b5")}
        >
          Conecte-se no LinkedIn
        </a>
        <a
          href="https://github.com/lucaskarsten"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
            fontSize: "1rem",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#555")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#333")}
        >
          Veja meu GitHub
        </a>
      </div>
    </div>
  );
}
