{
  description = "linen, a calm design language for React apps";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      inherit (nixpkgs) lib;
      forSystems = lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
      ];
      pkgsFor = system: nixpkgs.legacyPackages.${system};
    in
    {
      devShells = forSystems (system: {
        default = (pkgsFor system).mkShell {
          name = "linen";
          packages = with (pkgsFor system); [
            nodejs_24
            pnpm
          ];
        };
      });

      # Formatting, lint, types and tests, then the specimen's build, which
      # compiles every component through Tailwind and Vite as an app does.
      # Tailwind drops a class it does not know without an error, so a
      # misspelt utility shows only in the specimen itself.
      checks = forSystems (
        system:
        let
          pkgs = pkgsFor system;
          src = lib.fileset.toSource {
            root = ./.;
            fileset = lib.fileset.difference ./. (
              lib.fileset.unions [
                ./flake.nix
                ./flake.lock
                (lib.fileset.maybeMissing ./node_modules)
                (lib.fileset.maybeMissing ./dist)
                (lib.fileset.maybeMissing ./result)
              ]
            );
          };
        in
        {
          default = pkgs.stdenvNoCC.mkDerivation (finalAttrs: {
            pname = "linen-check";
            version = (lib.importJSON ./package.json).version;
            inherit src;
            nativeBuildInputs = [
              pkgs.nodejs_24
              pkgs.pnpm
              pkgs.pnpmConfigHook
            ];
            # After changing pnpm-lock.yaml, set `hash = lib.fakeHash;`, run
            # `nix flake check`, and copy the hash Nix reports.
            pnpmDeps = pkgs.fetchPnpmDeps {
              inherit (finalAttrs) pname version src;
              pnpm = pkgs.pnpm;
              fetcherVersion = 5;
              hash = "sha256-RYM6oKI1oVXb5IEcyDtEkT6vLOIi/1I2Y4XbZ4PtV2M=";
            };
            buildPhase = ''
              runHook preBuild
              pnpm run check
              runHook postBuild
            '';
            installPhase = "touch $out";
          });
        }
      );
    };
}
