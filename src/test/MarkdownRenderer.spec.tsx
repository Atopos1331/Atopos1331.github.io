import { fireEvent, render, screen } from "../utils/test-utils";
import { describe, expect, it, vi } from "vitest";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { terminalRunEventName } from "../utils/terminalEvents";

describe("MarkdownRenderer", () => {
  it("renders GFM tables, strikethrough, and task lists", () => {
    render(
      <MarkdownRenderer
        source={[
          "| Name | Value |",
          "| --- | --- |",
          "| blur | 0 |",
          "",
          "~~old~~",
          "",
          "- [x] shipped",
          "- [ ] pending",
        ].join("\n")}
      />
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("blur")).toBeInTheDocument();
    expect(screen.getByText("old").tagName.toLowerCase()).toBe("del");
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("keeps registered shell commands executable inside inline code", () => {
    const eventHandler = vi.fn();
    window.addEventListener(terminalRunEventName, eventHandler as EventListener);

    render(
      <MarkdownRenderer
        source="Run `preview ~/profile/about.md` but leave `npm run dev` as plain code."
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /preview ~\/profile\/about\.md/i })
    );

    expect(eventHandler).toHaveBeenCalledTimes(1);
    expect(screen.getByText("npm run dev").tagName.toLowerCase()).toBe("code");

    window.removeEventListener(terminalRunEventName, eventHandler as EventListener);
  });
});
