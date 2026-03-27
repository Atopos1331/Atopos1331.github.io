export const workspaceCommandPulseEventName = "workspace-command-pulse";
export const workspaceGlitchEventName = "workspace-glitch";
export const workspacePreviewGlitchEventName = workspaceGlitchEventName;

export const emitWorkspaceCommandPulse = (command: string) => {
  window.dispatchEvent(
    new CustomEvent(workspaceCommandPulseEventName, {
      detail: {
        command,
      },
    })
  );
};

export const emitWorkspaceGlitch = () => {
  window.dispatchEvent(new CustomEvent(workspaceGlitchEventName));
};

export const emitWorkspacePreviewGlitch = emitWorkspaceGlitch;
