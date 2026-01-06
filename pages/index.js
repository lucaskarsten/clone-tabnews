import Head from "next/head";
import Image from "next/image";

function Home() {
  return (
    <>
      <Head>
        <title>Te Amo, Beatriz ❤️</title>
      </Head>
      <div
        style={{
          background:
            "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          color: "#333",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#d63384", fontSize: "3em", marginBottom: "10px" }}>
          Te Amo, Minha Princesa! 💖
        </h1>
        <h2 style={{ color: "#6f42c1", fontSize: "2em", marginBottom: "20px" }}>
          Obrigado por Tudo Que Você Faz
        </h2>
        <p
          style={{
            fontSize: "1.2em",
            lineHeight: "1.6",
            maxWidth: "600px",
            marginBottom: "30px",
          }}
        >
          Você é a luz da minha vida, a razão do meu sorriso todos os dias.
          Obrigado por ser minha companheira, minha amiga e meu amor eterno.
          Cada momento ao seu lado é um tesouro que guardo no coração. Te amo
          mais do que palavras podem expressar! 🌹
        </p>
        <Image
          src="https://i.imgur.com/acasM70.jpeg"
          alt="foto"
          width={720}
          height={1280}
          style={{
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />
      </div>
    </>
  );
}

export default Home;
