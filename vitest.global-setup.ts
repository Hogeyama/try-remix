import { exec, type ExecException } from "node:child_process";
import { createServer, type AddressInfo } from "node:net";

export default async function () {
  const port = await getFreePort();
  await startProcessCompose(port);
  return async () => {
    // なぜかSIGTERMが飛んでしまう。stopProcessCompose参照
    process.on("SIGTERM", async () => {});
    stopProcessCompose(port);
  };
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function startProcessCompose(pcPort: number) {
  let pcError: ExecException | null = null;
  console.log("Starting Postgres...");
  exec(
    `nix run '.#processes-dev' -- --port ${pcPort} run postgres`,
    (error) => {
      if (error) {
        pcError = error;
      }
    },
  );

  // wait for Postgres to start
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (await isPostgresReady(pcPort)) {
      return;
    }
    if (pcError) {
      console.error(pcError);
      break;
    }
  }

  // give up: throw exception to fail the whole test
  console.error("Failed to start Postgres. Shutting down...");
  console.error("HINT: try `pkill process-compose` to clean up");
  try {
    shutdownProcessCompose(pcPort);
  } catch (_) {}
  console.log("Done.");
  throw new Error("Failed to start Postgres.");
}

async function stopProcessCompose(pcPort: number) {
  console.log("Stoping Postgres...");
  if (await shutdownProcessCompose(pcPort)) {
    console.log("Postgres stopped.");
  } else {
    console.error("Failed to stop Postgres");
  }
}

async function isPostgresReady(pcPort: number): Promise<boolean> {
  try {
    const resp = await fetch(`http://localhost:${pcPort}/process/postgres`);
    const body = await resp.json();
    if (body?.status === "Running") {
      return true;
    }
  } catch (error) {
    // ignore connection refused errors (server not ready yet)
    // biome-ignore lint/suspicious/noExplicitAny: 許せ
    if ((error as any)?.cause?.code !== "ECONNREFUSED") {
      throw error;
    }
  }
  return false;
}

// NOTE: process-compose-flakeがexecを使ってないのでSIGINTを送ることはできない。
// FIXME: なぜかこれを呼ぶとvitestにSIGTERMが飛ぶ
async function shutdownProcessCompose(pcPort: number) {
  try {
    const resp = await fetch(
      new Request(`http://localhost:${pcPort}/project/stop`, {
        method: "POST",
      }),
    );
    return resp.ok;
  } catch (error) {
    // ignore connection refused errors (server already down)
    // biome-ignore lint/suspicious/noExplicitAny: 許せ
    if ((error as any)?.cause?.code !== "ECONNREFUSED") {
      throw error;
    }
  }
}
