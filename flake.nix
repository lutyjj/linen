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

      # The tarball a release attaches, packed from the locked dependencies
      # once `pnpm run check` passes: the package's build, which publint and
      # attw check as packed, then formatting, lint, types, tests and the
      # specimen's build, which compiles every component through Tailwind and
      # Vite as an app does. Tailwind drops a class it does not know without
      # an error, so a misspelt utility shows only in the specimen itself.
      packages = forSystems (
        system:
        let
          pkgs = pkgsFor system;
          src = lib.fileset.toSource {
            root = ./.;
            fileset = lib.fileset.difference ./. (
              lib.fileset.unions [
                ./flake.nix
                ./flake.lock
                (lib.fileset.maybeMissing ./.github)
                (lib.fileset.maybeMissing ./node_modules)
                (lib.fileset.maybeMissing ./dist)
                (lib.fileset.maybeMissing ./specimen/dist)
                (lib.fileset.maybeMissing ./result)
              ]
            );
          };
        in
        {
          default = pkgs.stdenvNoCC.mkDerivation (finalAttrs: {
            pname = "linen";
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
              hash = "sha256-cNFUuL5UIbOr6kV+VjNXWpId/OxB6xrSm5mjNIuyhq0=";
            };
            # tsdown writes package.json's exports, and an app that uses a
            # checkout as a workspace package reads the committed ones, so the
            # two must agree.
            buildPhase = ''
              runHook preBuild
              cp package.json "$TMPDIR/package.json"
              pnpm run check
              if ! diff -u "$TMPDIR/package.json" package.json; then
                echo "package.json is not what tsdown writes: run pnpm run build and commit it" >&2
                exit 1
              fi
              runHook postBuild
            '';
            installPhase = ''
              runHook preInstall
              mkdir -p $out
              pnpm pack --pack-destination $out
              runHook postInstall
            '';
            # The built module loads in Node, as a test runner or a server
            # render loads it.
            doInstallCheck = true;
            installCheckPhase = ''
              runHook preInstallCheck
              node --input-type=module -e 'await import("./dist/index.js")'
              runHook postInstallCheck
            '';
          });
        }
      );

      # Building the package runs every check.
      checks = forSystems (system: {
        inherit (self.packages.${system}) default;
      });
    };
}
