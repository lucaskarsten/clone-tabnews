import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fethStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fethStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw new Error("Web server is not ready yet");
      }
    }
  }
}

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
