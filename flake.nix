{
  description = "Try Next.js App Router";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-parts.url = "github:hercules-ci/flake-parts";
    flake-root.url = "github:srid/flake-root";
    devshell.url = "github:numtide/devshell";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      flake-parts,
      ...
    }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        inputs.flake-root.flakeModule
        inputs.devshell.flakeModule
        inputs.process-compose-flake.flakeModule
      ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      perSystem =
        {
          config,
          lib,
          self',
          inputs',
          pkgs,
          system,
          ...
        }:
        {
          _module.args.pkgs = import inputs.nixpkgs { inherit system; };

          devshells.default = {
            packages = [
              pkgs.yarn
              pkgs.nodejs
              pkgs.biome
              pkgs.nodePackages.prisma
              pkgs.playwright-driver.browsers
            ];
            commands = [
              {
                name = "dev";
                help = "Run dev server and postgres";
                command = ''nix run .#processes-dev -- "$@"'';
              }
            ];
            env = [
              {
                name = "PRISMA_SCHEMA_ENGINE_BINARY";
                value = "${pkgs.prisma-engines}/bin/schema-engine";
              }
              {
                name = "PRISMA_QUERY_ENGINE_BINARY";
                value = "${pkgs.prisma-engines}/bin/query-engine";
              }
              {
                name = "PRISMA_QUERY_ENGINE_LIBRARY";
                value = "${pkgs.prisma-engines}/lib/libquery_engine.node";
              }
              {
                name = "PRISMA_FMT_BINARY";
                value = "${pkgs.prisma-engines}/bin/prisma-fmt";
              }
              {
                name = "PLAYWRIGHT_BROWSERS_PATH";
                value = "${pkgs.playwright-driver.browsers}";
              }
              {
                name = "PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS";
                value = "true";
              }
              {
                name = "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD";
                value = "true";
              }
            ];
          };

          process-compose =
            let
              pg_port = 5432;
              postgres = {
                command = pkgs.writeShellApplication {
                  name = "postgres";
                  runtimeInputs = [ pkgs.postgresql ];
                  text = ''
                    set -e
                    PGDATA=''${PRJ_DATA_DIR}/postgres
                    if ! [[ -e "$PGDATA/PG_VERSION" ]]; then
                        mkdir -p "$PGDATA"
                        initdb -U postgres -D "$PGDATA" -A trust
                    fi
                    postgres -D "$PGDATA" -k "$PGDATA" -p ${toString pg_port}
                  '';
                };
                readiness_probe = {
                  period_seconds = 1;
                  exec = {
                    command = "${lib.getExe (
                      pkgs.writeShellApplication {
                        name = "pg_isready";
                        runtimeInputs = [ pkgs.postgresql ];
                        text = ''
                          PGDATA=''${PRJ_DATA_DIR}/postgres
                          pg_isready --host "$PGDATA" -U postgres
                        '';
                      }
                    )}";
                  };
                };
              };
              dev = {
                command = "yarn run dev";
              };
            in
            {
              processes-dev = {
                port = 10000;
                settings.processes = {
                  inherit postgres dev;
                };
              };
            };
        };
    };
}
