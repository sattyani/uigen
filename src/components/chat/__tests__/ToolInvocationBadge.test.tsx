import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

test("str_replace_editor create - loading shows Creating, done shows Created", () => {
  const { rerender } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/src/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();

  rerender(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/src/App.jsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Created App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace - Editing / Edited", () => {
  const { rerender } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/Button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();

  rerender(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/Button.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Edited Button.tsx")).toBeDefined();
});

test("str_replace_editor insert - Editing / Edited", () => {
  const { rerender } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/Button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();

  rerender(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/Button.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Edited Button.tsx")).toBeDefined();
});

test("str_replace_editor undo_edit - Undoing edit to / Undid edit to", () => {
  const { rerender } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "/App.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Undoing edit to App.tsx")).toBeDefined();

  rerender(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "/App.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Undid edit to App.tsx")).toBeDefined();
});

test("str_replace_editor view - Reading / Read", () => {
  const { rerender } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Reading App.tsx")).toBeDefined();

  rerender(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Read App.tsx")).toBeDefined();
});

test("file_manager rename - Renaming / Renamed", () => {
  const { rerender } = render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/old.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Renaming old.tsx")).toBeDefined();

  rerender(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/old.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Renamed old.tsx")).toBeDefined();
});

test("file_manager delete - Deleting / Deleted", () => {
  const { rerender } = render(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/old.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Deleting old.tsx")).toBeDefined();

  rerender(
    <ToolInvocationBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/old.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Deleted old.tsx")).toBeDefined();
});

test("unknown tool - fallback Running / Ran", () => {
  const { rerender } = render(
    <ToolInvocationBadge
      toolName="some_tool"
      args={{}}
      state="call"
    />
  );
  expect(screen.getByText("Running some_tool")).toBeDefined();

  rerender(
    <ToolInvocationBadge
      toolName="some_tool"
      args={{}}
      state="result"
    />
  );
  expect(screen.getByText("Ran some_tool")).toBeDefined();
});

test("path with nested dirs - only shows basename", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/src/components/ui/Button.tsx" }}
      state="result"
    />
  );
  expect(screen.getByText("Created Button.tsx")).toBeDefined();
});

test("no path - label omits filename", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create" }}
      state="result"
    />
  );
  expect(screen.getByText("Created")).toBeDefined();
});

test("loading state shows spinner, done state shows green dot", () => {
  const { container, rerender } = render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  // Loader2 renders as an svg with animate-spin
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();

  rerender(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".animate-spin")).toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});
