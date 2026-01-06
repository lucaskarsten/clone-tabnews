import Image from "next/image";

function Home() {
  return (
    <div>
      <h1>Te amo.</h1>
      <h1>Obrigado por tudo</h1>

      <Image
        src="https://i.imgur.com/acasM70.jpeg"
        alt="foto"
        width={720}
        height={1280}
      />
    </div>
  );
}

export default Home;
