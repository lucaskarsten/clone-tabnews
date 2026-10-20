module.exports = {
  images: {
    domains: ["imgur.com", "i.imgur.com"],
  },
  // Navegadores ainda pedem /favicon.ico direto, sem ler o <link rel="icon">.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon.svg" }];
  },
};
