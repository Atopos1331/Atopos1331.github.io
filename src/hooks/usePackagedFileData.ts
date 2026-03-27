import { useEffect, useState } from "react";
import { getFileBytes } from "../shell/filesystem";
import {
  decodeExecutableBytes,
  decodePluginBytes,
} from "../utils/elfCodec";
import type { WorkspaceExecutableManifest } from "../utils/workspaceExecutableManifest";
import type { WorkspacePluginManifest } from "../utils/workspacePluginManifest";

type PackagedFileDecoder<TDecoded> = (bytes: Uint8Array) => TDecoded;

type PackagedFileDataState<TManifest> = {
  error: string | null;
  loading: boolean;
  manifest: TManifest | null;
  sourceText: string;
};

const initialState: PackagedFileDataState<never> = {
  error: null,
  loading: false,
  manifest: null,
  sourceText: "",
};

const usePackagedFileDataInternal = <
  TManifest,
  TDecoded extends { manifest: TManifest | null; sourceText: string },
>(
  path: string | null | undefined,
  decoder: PackagedFileDecoder<TDecoded>,
  errorLabel: string
) => {
  const [state, setState] =
    useState<PackagedFileDataState<TManifest>>(initialState);

  useEffect(() => {
    if (!path) {
      setState(initialState);
      return;
    }

    let disposed = false;

    setState(previousState => ({
      ...previousState,
      error: null,
      loading: true,
    }));

    void getFileBytes(path)
      .then(bytes => {
        if (disposed) {
          return;
        }

        if (!bytes) {
          throw new Error(`Unable to read ${errorLabel} file.`);
        }

        const decoded = decoder(bytes);
        setState({
          error: null,
          loading: false,
          manifest: decoded.manifest,
          sourceText: decoded.sourceText,
        });
      })
      .catch((error: unknown) => {
        if (disposed) {
          return;
        }

        setState({
          error:
            error instanceof Error
              ? error.message
              : `Unable to decode ${errorLabel} file.`,
          loading: false,
          manifest: null,
          sourceText: "",
        });
      });

    return () => {
      disposed = true;
    };
  }, [decoder, errorLabel, path]);

  return state;
};

export type PluginPackageDataState = PackagedFileDataState<WorkspacePluginManifest>;
export type ExecutablePackageDataState =
  PackagedFileDataState<WorkspaceExecutableManifest>;

export const usePluginPackageData = (
  path: string | null | undefined
): PluginPackageDataState =>
  usePackagedFileDataInternal<WorkspacePluginManifest, ReturnType<typeof decodePluginBytes>>(
    path,
    decodePluginBytes,
    "plugin"
  );

export const useExecutablePackageData = (
  path: string | null | undefined
): ExecutablePackageDataState =>
  usePackagedFileDataInternal<
    WorkspaceExecutableManifest,
    ReturnType<typeof decodeExecutableBytes>
  >(path, decodeExecutableBytes, "executable");
