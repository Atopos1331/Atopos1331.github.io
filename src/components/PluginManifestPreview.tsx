import { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { workspaceContext } from "../workspace/workspaceStore";
import { basename, dirname, displayPath } from "../shell/filesystem";
import { runTerminalCommand } from "../utils/terminalEvents";
import type {
  WorkspacePluginManifest,
  WorkspacePluginParamSchemaField,
} from "../utils/workspacePluginManifest";
import { normalizePluginColor } from "../utils/workspacePluginManifest";
import HighlightedCode from "./HighlightedCode";
import {
  ButtonRow,
  ControlsCard,
  Description,
  ErrorText,
  Hero,
  InfoText,
  MetaCard,
  MetaGrid,
  MetaLabel,
  MetaValue,
  Title,
  Wrapper,
} from "./manifestPreviewShared";

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.8rem;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.secondary};
`;

const Dot = styled.span<{ $active: boolean }>`
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors?.primary : theme.colors?.text[200]};
  box-shadow: 0 0 16px
    ${({ $active, theme }) =>
      `${$active ? theme.colors?.primary : theme.colors?.text[200]}88`};
`;

const ControlGrid = styled.div`
  display: grid;
  gap: 0.85rem;
  grid-template-columns: 1fr;
`;

const SectionHeading = styled.div`
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors?.text[200]};
`;

const ParamCard = styled.label`
  display: grid;
  min-width: 0;
  gap: 0.45rem;
  padding: 0.85rem 0.95rem;
  border-radius: 0.85rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}2f`};
  background: ${({ theme }) => `${theme.colors?.body}A6`};
  box-shadow:
    inset 0 0 0 1px ${({ theme }) => `${theme.colors?.text[300]}12`},
    0 0 0 1px ${({ theme }) => `${theme.colors?.primary}10`};
`;

const ParamName = styled.span`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text[100]};
`;

const ParamMeta = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: 0.82rem;
  line-height: 1.55;
`;

const ParamInput = styled.input`
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.7rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}66`};
  border-radius: 0.55rem;
  background: ${({ theme }) => `${theme.colors?.body}D8`};
  color: ${({ theme }) => theme.colors?.text[100]};
  font: inherit;
  box-shadow: inset 0 0 0 1px ${({ theme }) => `${theme.colors?.text[300]}12`};

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 2px;
  }
`;

const ParamSelect = styled.select`
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.7rem;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}66`};
  border-radius: 0.55rem;
  background: ${({ theme }) => `${theme.colors?.body}D8`};
  color: ${({ theme }) => theme.colors?.text[100]};
  font: inherit;
  box-shadow: inset 0 0 0 1px ${({ theme }) => `${theme.colors?.text[300]}12`};

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 2px;
  }
`;

const RangeMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: ${({ theme }) => theme.colors?.text[200]};
  font-size: 0.76rem;
`;

const RangeValue = styled.span`
  color: ${({ theme }) => theme.colors?.primary};
  font-weight: 700;
`;

const ActionButton = styled.button<{ $variant?: "secondary" }>`
  padding: 0.6rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid
    ${({ $variant, theme }) =>
      $variant === "secondary"
        ? `${theme.colors?.text[300]}66`
        : `${theme.colors?.primary}66`};
  background: ${({ $variant, theme }) =>
    $variant === "secondary"
      ? `${theme.colors?.text[300]}12`
      : `${theme.colors?.primary}14`};
  color: ${({ $variant, theme }) =>
    $variant === "secondary" ? theme.colors?.text[100] : theme.colors?.primary};
  font: inherit;
  cursor: pointer;
`;

const ColorInputWrap = styled.div`
  display: grid;
  min-width: 0;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 0.55rem;
  align-items: center;
`;

const ColorPrefix = styled.span`
  color: ${({ theme }) => theme.colors?.text[200]};
  font-weight: 700;
`;

const ColorPickerButton = styled.label<{ $color: string }>`
  position: relative;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => `${theme.colors?.primary}72`};
  background: ${({ $color }) => $color};
  box-shadow:
    inset 0 0 0 2px ${({ theme }) => `${theme.colors?.body}CC`},
    0 0 0 1px ${({ theme }) => `${theme.colors?.text[300]}16`};
  overflow: hidden;
  cursor: pointer;

  &:focus-within {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 2px;
  }
`;

const ColorPickerInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  opacity: 0;
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: 0;
    border-radius: 999px;
  }
`;

type Props = {
  error?: string | null;
  manifest: WorkspacePluginManifest | null;
  path: string;
  sourceText: string;
};

const toInputValue = (
  field: WorkspacePluginParamSchemaField,
  value: unknown
) => {
  if (value === undefined) {
    return field.defaultValue !== undefined ? String(field.defaultValue) : "";
  }

  return String(value);
};

const quoteAssignment = (assignment: string) =>
  /\s/.test(assignment) ? `"${assignment.replaceAll('"', '\\"')}"` : assignment;

const buildOverrideEntries = (
  manifest: WorkspacePluginManifest,
  values: Record<string, string>,
  forceAll = false
) =>
  manifest.paramsSchema.flatMap(field => {
    const nextValue = values[field.key] ?? "";
    const baseValue = toInputValue(
      field,
      manifest.params[field.key] ?? field.defaultValue
    );

    if (!forceAll && nextValue === baseValue) {
      return [];
    }

    return quoteAssignment(`${field.key}=${nextValue}`);
  });

const PluginManifestPreview: React.FC<Props> = ({
  error,
  manifest,
  path,
  sourceText,
}) => {
  const workspace = useContext(workspaceContext);
  const isActive = workspace?.activePluginPaths.includes(path) ?? false;
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const badgeLabel = isActive ? "plugin enabled" : "plugin disabled";

  useEffect(() => {
    if (!manifest) {
      setFormValues({});
      return;
    }

    const seedManifest =
      workspace?.activePluginStates.find(state => state.path === path)?.manifest ??
      manifest;

    setFormValues(
      Object.fromEntries(
        seedManifest.paramsSchema.map(field => [
          field.key,
          toInputValue(
            field,
            seedManifest.params[field.key] ?? field.defaultValue
          ),
        ])
      )
    );
  }, [manifest, path, workspace?.activePluginStates]);

  const parameterCommand = useMemo(() => {
    if (!manifest) {
      return "";
    }

    const forceExplicit = isActive;
    const overrides = buildOverrideEntries(manifest, formValues, forceExplicit);
    return `plugin ${basename(path)}${overrides.length > 0 ? ` ${overrides.join(" ")}` : ""}`;
  }, [formValues, isActive, manifest, path]);

  const runInPluginDirectory = (command: string) => {
    runTerminalCommand([`cd ${displayPath(dirname(path))}`, command]);
  };

  if (!manifest) {
    return (
      <Wrapper>
        <Hero>
          <Title>Invalid `.plg` Plugin</Title>
          <Description>
            This file decoded successfully, but its manifest structure is invalid.
          </Description>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </Hero>
        <HighlightedCode code={sourceText} language="json" />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Hero>
        <Title>{manifest.name}</Title>
        {manifest.description ? (
          <Description>{manifest.description}</Description>
        ) : null}
        <Status>
          <Dot $active={isActive} />
          {badgeLabel}
        </Status>
      </Hero>
      <MetaGrid>
        <MetaCard>
          <MetaLabel>Module</MetaLabel>
          <MetaValue>{manifest.entry.module}</MetaValue>
        </MetaCard>
        <MetaCard>
          <MetaLabel>Scope</MetaLabel>
          <MetaValue>{manifest.entry.scope ?? "workspace"}</MetaValue>
        </MetaCard>
        <MetaCard>
          <MetaLabel>Mount</MetaLabel>
          <MetaValue>{manifest.entry.mount ?? "background"}</MetaValue>
        </MetaCard>
      </MetaGrid>
      <ControlsCard>
        <SectionHeading>Plugin Actions</SectionHeading>
        <ButtonRow>
          <ActionButton type="button" onClick={() => runInPluginDirectory(parameterCommand)}>
            {isActive ? "update plugin" : "enable plugin"}
          </ActionButton>
          {isActive ? (
            <ActionButton
              $variant="secondary"
              type="button"
              onClick={() => runInPluginDirectory(`plugin ${basename(path)}`)}
            >
              disable plugin
            </ActionButton>
          ) : null}
          <ActionButton
            $variant="secondary"
            type="button"
            onClick={() => runInPluginDirectory(`plugin detail ${basename(path)}`)}
          >
            Current Detail
          </ActionButton>
        </ButtonRow>
        <InfoText>
          Use <code>plugin detail</code> to inspect the currently active plugin
          from the terminal. This panel runs the same command path as the
          terminal and always executes from <code>{displayPath(dirname(path))}</code>.
        </InfoText>
        <InfoText>
          Command preview: <code>{parameterCommand}</code>
        </InfoText>
      </ControlsCard>
      <ControlsCard>
        <SectionHeading>Parameters</SectionHeading>
        <ControlGrid>
          {manifest.paramsSchema.map(field => (
            <ParamEditor
              field={field}
              key={field.key}
              value={formValues[field.key] ?? ""}
              onChange={nextValue =>
                setFormValues(previousState => ({
                  ...previousState,
                  [field.key]: nextValue,
                }))
              }
            />
          ))}
        </ControlGrid>
      </ControlsCard>
      <HighlightedCode code={sourceText} language="json" />
    </Wrapper>
  );
};

type ParamEditorProps = {
  field: WorkspacePluginParamSchemaField;
  onChange: (value: string) => void;
  value: string;
};

const ParamEditor: React.FC<ParamEditorProps> = ({ field, onChange, value }) => {
  const normalizedColorValue = normalizePluginColor(
    value,
    String(field.defaultValue ?? "ffffff")
  );
  const numberRangeLabel =
    field.type === "number" && (field.min !== undefined || field.max !== undefined)
      ? `${field.min ?? "-inf"} to ${field.max ?? "+inf"}`
      : null;
  const metaText = [
    field.type,
    field.pattern ? `regex: ${field.pattern}` : null,
    field.description ?? null,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <ParamCard>
      <ParamName>{field.label}</ParamName>
      <ParamMeta>{metaText}</ParamMeta>
      {field.type === "boolean" ? (
        <ParamSelect value={value} onChange={event => onChange(event.target.value)}>
          <option value="true">true</option>
          <option value="false">false</option>
        </ParamSelect>
      ) : field.type === "select" ? (
        <ParamSelect value={value} onChange={event => onChange(event.target.value)}>
          {(field.options ?? []).map(option => (
            <option key={`${field.key}-${option.value}`} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </ParamSelect>
      ) : field.type === "color" ? (
        <ColorInputWrap>
          <ColorPickerButton $color={normalizedColorValue}>
            <ColorPickerInput
              aria-label={`${field.label} color picker`}
              onChange={event => onChange(event.target.value.replace(/^#/, ""))}
              type="color"
              value={normalizedColorValue}
            />
          </ColorPickerButton>
          <ColorPrefix>#</ColorPrefix>
          <ParamInput
            onChange={event =>
              onChange(event.target.value.replace(/^#+/, ""))
            }
            placeholder={field.placeholder}
            type="text"
            value={value.replace(/^#+/, "")}
          />
        </ColorInputWrap>
      ) : (
        <>
          <ParamInput
            max={field.max}
            min={field.min}
            onChange={event => onChange(event.target.value)}
            placeholder={field.placeholder}
            step={field.step}
            type={field.type === "number" ? "number" : "text"}
            value={value}
          />
          {field.type === "number" && (numberRangeLabel || field.step !== undefined) ? (
            <RangeMeta>
              <span>
                {numberRangeLabel ? `range: ${numberRangeLabel}` : "range: unbounded"}
                {field.step !== undefined ? ` | step: ${field.step}` : ""}
              </span>
              <RangeValue>{value}</RangeValue>
            </RangeMeta>
          ) : null}
        </>
      )}
    </ParamCard>
  );
};

export default PluginManifestPreview;
