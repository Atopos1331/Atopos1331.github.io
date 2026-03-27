export type ProgramSessionDescriptor = {
  name: string;
  path: string;
  script: string;
};

export type MainToProgramWorkerMessage =
  | {
      descriptor: ProgramSessionDescriptor;
      type: "start";
    }
  | {
      text: string;
      type: "stdin";
    };

export type ProgramWorkerToMainMessage =
  | {
      text: string;
      type: "stdout";
    }
  | {
      text: string;
      type: "stderr";
    }
  | {
      type: "clear";
    }
  | {
      code: number;
      type: "exit";
    }
  | {
      message: string;
      type: "error";
    };
