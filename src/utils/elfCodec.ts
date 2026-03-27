import {
  parseWorkspacePluginManifest,
  type WorkspacePluginManifest,
} from "./workspacePluginManifest";
import {
  parseWorkspaceExecutableManifest,
  type WorkspaceExecutableManifest,
} from "./workspaceExecutableManifest";

const packageHeaderSize = 16;
const packageFormatVersion = 1;
const packageCodecVersion = 1;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

type PackageKind = "executable" | "plugin";

type PackageCodecConfig<TManifest> = {
  errorLabel: string;
  kind: PackageKind;
  magic: Uint8Array;
  parseManifest: (sourceText: string) => TManifest | null;
};

const pluginCodecConfig: PackageCodecConfig<WorkspacePluginManifest> = {
  errorLabel: "PLG",
  kind: "plugin",
  magic: new Uint8Array([0x7f, 0x50, 0x4c, 0x47]),
  parseManifest: parseWorkspacePluginManifest,
};

const executableCodecConfig: PackageCodecConfig<WorkspaceExecutableManifest> = {
  errorLabel: "EXE",
  kind: "executable",
  magic: new Uint8Array([0x7f, 0x45, 0x58, 0x45]),
  parseManifest: parseWorkspaceExecutableManifest,
};

type DecodedPackageFile<TManifest> = {
  codecVersion: number;
  formatVersion: number;
  kind: PackageKind;
  manifest: TManifest | null;
  seed: number;
  sourceText: string;
};

export type DecodedPluginFile = DecodedPackageFile<WorkspacePluginManifest>;
export type DecodedExecutableFile =
  DecodedPackageFile<WorkspaceExecutableManifest>;
export type DecodedElfFile = DecodedPluginFile;

const rotateSeedByte = (seed: number, index: number) =>
  (seed >>> ((index % 4) * 8)) & 0xff;

const transformPayload = (payload: Uint8Array, seed: number) =>
  payload.map(
    (value, index) => value ^ rotateSeedByte(seed, index) ^ ((index * 31 + 17) & 0xff)
  );

const validateMagic = (bytes: Uint8Array, magic: Uint8Array) =>
  magic.every((value, index) => bytes[index] === value);

const encodePackagedSource = <TManifest>(
  sourceText: string,
  config: PackageCodecConfig<TManifest>,
  seed = 0x1a2b3c4d
) => {
  const sourceBytes = textEncoder.encode(sourceText);
  const encodedPayload = transformPayload(sourceBytes, seed);
  const buffer = new Uint8Array(packageHeaderSize + encodedPayload.length);
  const view = new DataView(buffer.buffer);

  buffer.set(config.magic, 0);
  view.setUint8(4, packageFormatVersion);
  view.setUint8(5, packageCodecVersion);
  view.setUint16(6, 0, true);
  view.setUint32(8, encodedPayload.length, true);
  view.setUint32(12, seed, true);
  buffer.set(encodedPayload, packageHeaderSize);

  return buffer;
};

const decodePackagedBytes = <TManifest>(
  bytes: Uint8Array,
  config: PackageCodecConfig<TManifest>
): DecodedPackageFile<TManifest> => {
  if (bytes.length < packageHeaderSize || !validateMagic(bytes, config.magic)) {
    throw new Error(`Invalid ${config.errorLabel} header.`);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const formatVersion = view.getUint8(4);
  const codecVersion = view.getUint8(5);
  const payloadLength = view.getUint32(8, true);
  const seed = view.getUint32(12, true);

  if (formatVersion !== packageFormatVersion) {
    throw new Error(
      `Unsupported ${config.errorLabel} format version: ${formatVersion}.`
    );
  }

  if (codecVersion !== packageCodecVersion) {
    throw new Error(
      `Unsupported ${config.errorLabel} codec version: ${codecVersion}.`
    );
  }

  const payloadStart = packageHeaderSize;
  const payloadEnd = payloadStart + payloadLength;

  if (payloadEnd > bytes.length) {
    throw new Error(`${config.errorLabel} payload is truncated.`);
  }

  const encodedPayload = bytes.slice(payloadStart, payloadEnd);
  const sourceText = textDecoder.decode(transformPayload(encodedPayload, seed));

  return {
    codecVersion,
    formatVersion,
    kind: config.kind,
    manifest: config.parseManifest(sourceText),
    seed,
    sourceText,
  };
};

export const encodePluginSource = (sourceText: string, seed?: number) =>
  encodePackagedSource(sourceText, pluginCodecConfig, seed);

export const decodePluginBytes = (bytes: Uint8Array): DecodedPluginFile =>
  decodePackagedBytes(bytes, pluginCodecConfig);

export const encodeExecutableSource = (sourceText: string, seed?: number) =>
  encodePackagedSource(sourceText, executableCodecConfig, seed);

export const decodeExecutableBytes = (
  bytes: Uint8Array
): DecodedExecutableFile => decodePackagedBytes(bytes, executableCodecConfig);

// Compatibility aliases kept until all legacy imports are migrated.
export const encodeElfSource = encodePluginSource;
export const decodeElfBytes = decodePluginBytes;
