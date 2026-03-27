import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  dirname,
  displayPath,
  getShellInputPath,
  listDirectory,
  shellRootPath,
} from "../shell/filesystem";
import { runTerminalCommand } from "../utils/terminalEvents";
import { workspaceContext } from "../workspace/workspaceStore";
import themes from "./styles/themes";
import {
  ActionButton,
  ActionGrid,
  CurrentPath,
  EntryIcon,
  EntryMeta,
  EntryName,
  PanelBody,
  PanelFooter,
  PanelItem,
  PanelSection,
  PanelSectionBody,
  PanelSectionLabel,
  PanelShell,
  PanelTitle,
  PanelToggle,
  PanelToggleIcon,
  PanelTree,
  PanelTreeHeader,
  ThemeMenuCaret,
  ThemeMenuItem,
  ThemeMenuList,
  ThemeMenuShell,
  ThemeMenuTrigger,
  ThemeMenuValue,
  TreeHeaderIcon,
  TreeHeaderMain,
} from "./styles/CommandPanel.styled";

type CommandPanelProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const actionItems = [
  { id: "description", command: "preview ~/description.md", label: "Description" },
  { id: "about", command: "preview ~/profile/about.md", label: "About" },
  { id: "programs", command: "preview ~/programs/README.md", label: "Programs" },
  { id: "plugins", command: "preview ~/plugins/README.md", label: "Plugins" },
  { id: "github", command: "github", label: "GitHub" },
  { id: "linkedin", command: "linkedin", label: "LinkedIn" },
] as const;

const themeItems = Object.keys(themes);
const getStoredThemeName = () => window.localStorage.getItem("tsn-theme") ?? "dark";

const CommandPanel: React.FC<CommandPanelProps> = ({ collapsed, onToggle }) => {
  const workspace = useContext(workspaceContext);
  const [treeExpanded, setTreeExpanded] = useState(true);
  const [activeThemeName, setActiveThemeName] = useState(getStoredThemeName);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const currentDirectory = workspace?.cwd ?? shellRootPath;
  const activePreviewPath = workspace?.activePreviewPath ?? "";
  const parentDirectory =
    currentDirectory === shellRootPath ? null : dirname(currentDirectory);

  const treeEntries = useMemo(() => {
    const entries = listDirectory(currentDirectory) ?? [];

    return parentDirectory
      ? [
          {
            name: "..",
            path: parentDirectory,
            type: "directory" as const,
          },
          ...entries,
        ]
      : entries;
  }, [currentDirectory, parentDirectory]);

  const runCommand = (command: string) => {
    workspace?.ensureTerminalVisible();
    runTerminalCommand(command);
  };

  const runTreeEntry = (entryPath: string, entryType: "directory" | "file") => {
    if (entryType === "directory") {
      runCommand(`cd ${getShellInputPath(entryPath)}`);
      return;
    }

    runCommand(`preview ${getShellInputPath(entryPath)}`);
  };

  useEffect(() => {
    if (!themeMenuOpen) {
      return;
    }

    setActiveThemeName(getStoredThemeName());

    const handlePointerDown = (event: PointerEvent) => {
      if (!themeMenuRef.current?.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setThemeMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [themeMenuOpen]);

  return (
    <PanelShell $collapsed={collapsed} aria-label="Sidebar file tree">
      <PanelTitle $collapsed={collapsed}>
        <PanelToggle
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Open sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          type="button"
        >
          <PanelToggleIcon $collapsed={collapsed} aria-hidden="true" />
        </PanelToggle>
        {!collapsed && (
          <div>
            <strong>NAVIGATE</strong>
            <span>Current directory</span>
          </div>
        )}
      </PanelTitle>

      {!collapsed && (
        <>
          <PanelBody>
            <PanelSection>
              <PanelTreeHeader
                aria-expanded={treeExpanded}
                onClick={() => setTreeExpanded(expanded => !expanded)}
                type="button"
              >
                <TreeHeaderIcon $expanded={treeExpanded} aria-hidden="true" />
                <TreeHeaderMain>
                  <CurrentPath>{displayPath(currentDirectory)}</CurrentPath>
                  <EntryMeta>
                    {treeEntries.length} {treeEntries.length === 1 ? "entry" : "entries"}
                  </EntryMeta>
                </TreeHeaderMain>
              </PanelTreeHeader>
              {treeExpanded && (
                <PanelTree>
                  <PanelSectionBody>
                    {treeEntries.map(entry => (
                      <PanelItem
                        key={entry.path}
                        $active={
                          entry.type === "file"
                            ? entry.path === activePreviewPath
                            : entry.name !== ".." && entry.path === currentDirectory
                        }
                        $entryType={entry.type}
                        onClick={() => runTreeEntry(entry.path, entry.type)}
                        type="button"
                      >
                        <EntryIcon $entryType={entry.type} aria-hidden="true" />
                        <EntryName>{entry.name}</EntryName>
                      </PanelItem>
                    ))}
                  </PanelSectionBody>
                </PanelTree>
              )}
            </PanelSection>
          </PanelBody>

          <PanelFooter>
            <PanelSection>
              <PanelSectionLabel>actions</PanelSectionLabel>
              <ActionGrid>
                {actionItems.map(item => (
                  <ActionButton
                    key={item.id}
                    onClick={() => runCommand(item.command)}
                    type="button"
                  >
                    {item.label}
                  </ActionButton>
                ))}
              </ActionGrid>
            </PanelSection>

            <PanelSection>
              <PanelSectionLabel>theme</PanelSectionLabel>
              <ThemeMenuShell ref={themeMenuRef}>
                {themeMenuOpen ? (
                  <ThemeMenuList role="listbox" aria-label="Theme menu">
                    {themeItems.map(themeName => (
                      <ThemeMenuItem
                        key={themeName}
                        $active={themeName === activeThemeName}
                        aria-selected={themeName === activeThemeName}
                        onClick={() => {
                          runCommand(`theme ${themeName}`);
                          setActiveThemeName(themeName);
                          setThemeMenuOpen(false);
                        }}
                        role="option"
                        type="button"
                      >
                        {themeName}
                      </ThemeMenuItem>
                    ))}
                  </ThemeMenuList>
                ) : null}
                <ThemeMenuTrigger
                  $open={themeMenuOpen}
                  aria-expanded={themeMenuOpen}
                  aria-haspopup="listbox"
                  aria-label="Theme menu"
                  onClick={() => setThemeMenuOpen(open => !open)}
                  type="button"
                >
                  <ThemeMenuValue>{activeThemeName}</ThemeMenuValue>
                  <ThemeMenuCaret $open={themeMenuOpen} aria-hidden="true" />
                </ThemeMenuTrigger>
              </ThemeMenuShell>
            </PanelSection>
          </PanelFooter>
        </>
      )}
    </PanelShell>
  );
};

export default CommandPanel;
