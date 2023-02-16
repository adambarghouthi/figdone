export const statusIcons = [
  "⚪", // to-do
  "🟡", // doing
  "✅", // done
  "⛔", // blocked
  "☠️", // cancelled
];

export const statusKeyToIcon: { [key: string]: string } = {
  "to-do": "⚪",
  doing: "🟡",
  done: "✅",
  blocked: "⛔",
  cancelled: "☠️",
};

export const statusIconToKey: { [key: string]: string } = {
  "⚪": "to-do",
  "🟡": "doing",
  "✅": "done",
  "⛔": "blocked",
  "☠️": "cancelled",
};

export const statusKeyToLabel = {
  "to-do": "To Do",
  doing: "Doing",
  done: "Done",
  blocked: "Blocked",
  cancelled: "Cancelled",
  "no-status": "No status",
};

export const statusOptions = [
  { label: "To do", value: "to-do" },
  { label: "Doing", value: "doing" },
  { label: "Done", value: "done" },
  { label: "Blocked", value: "blocked" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No status", value: "no-status" },
];
