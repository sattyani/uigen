import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
}

function getLabel(toolName: string, args: Record<string, unknown>, isDone: boolean): string {
  const path = typeof args.path === "string" ? args.path : undefined;
  const file = path ? path.split("/").pop() : undefined;
  const fileSuffix = file ? ` ${file}` : "";
  const command = args.command as string | undefined;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return isDone ? `Created${fileSuffix}` : `Creating${fileSuffix}`;
      case "str_replace":
      case "insert":
        return isDone ? `Edited${fileSuffix}` : `Editing${fileSuffix}`;
      case "undo_edit":
        return isDone ? `Undid edit to${fileSuffix}` : `Undoing edit to${fileSuffix}`;
      case "view":
        return isDone ? `Read${fileSuffix}` : `Reading${fileSuffix}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        return isDone ? `Renamed${fileSuffix}` : `Renaming${fileSuffix}`;
      case "delete":
        return isDone ? `Deleted${fileSuffix}` : `Deleting${fileSuffix}`;
    }
  }

  return isDone ? `Ran ${toolName}` : `Running ${toolName}`;
}

export function ToolInvocationBadge({ toolName, args, state }: ToolInvocationBadgeProps) {
  const isDone = state === "result";
  const label = getLabel(toolName, args, isDone);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone
        ? <div className="w-2 h-2 rounded-full bg-emerald-500" />
        : <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
