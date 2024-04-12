import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createServer, type AddressInfo } from "node:net";

export default async function () {
  const port = await getFreePort();
  const pc = await startProcessCompose(port);
  return async () => {
    shutdownProcessCompose(pc.process);
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

async function startProcessCompose(pcPort: number): Promise<{
  process: ChildProcessWithoutNullStreams;
  exitCode: number | null;
  output: string;
}> {
  console.log("Starting Postgres...");
  const process = spawn(
    "nix",
    ["run", ".#processes-dev", "--", "--port", `${pcPort}`, "run", "postgres"],
    // detachedで独立したプロセスグループにしておく。
    // （process-compose-flakeがprocess-composeをラップしているので
    //   process-composeだけに直接シグナルを送ることができないため、
    //   独立したプロセスグループにしてグループ全体にシグナルを送る）
    { detached: true },
  );

  const pcState = {
    process,
    exitCode: null as number | null,
    output: "" as string,
  };

  pcState.process.on("exit", (code) => {
    if (code !== null) {
      console.log(`process-compose exited with code ${code}`);
      pcState.exitCode = code;
    }
  });
  pcState.process.stdout?.on("data", (data) => {
    pcState.output += data;
  });
  pcState.process.stderr?.on("data", (data) => {
    pcState.output += data;
  });

  // wait for Postgres to start
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (pcState.exitCode !== null) {
      console.error(pcState.output);
      break;
    }
    if (await isPostgresReady(pcPort)) {
      console.log("Postgres started.");
      if (pcState.process !== null) {
        return pcState;
      }
    }
  }

  // give up: throw exception to fail the whole test
  console.error("Failed to start Postgres. Shutting down...");
  console.error("HINT: try `pkill process-compose` to clean up");
  try {
    shutdownProcessCompose(pcState.process);
  } catch (_) {
    // just ignore
  }
  console.log("Done.");
  throw new Error("Failed to start Postgres.");
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
    if (
      error instanceof Error &&
      typeof error.cause === "object" &&
      error.cause != null &&
      "code" in error.cause &&
      error?.cause.code === "ECONNREFUSED"
    ) {
      throw error;
    }
  }
  return false;
}

async function shutdownProcessCompose(pc: ChildProcessWithoutNullStreams) {
  if (pc.pid) {
    process.kill(-pc.pid, "SIGTERM");
  }
}
