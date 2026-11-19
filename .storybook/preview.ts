import type { Preview } from "@storybook/react-vite";

import "../src/styles/tokens.css";
import "../src/styles/global.css";

const preview: Preview = {
  tags: ["autodocs"],

  parameters: {
    layout: "padded",

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    options: {
      storySort: {
        order: [
          "Foundations",
          ["Overview", "Colors", "Typography", "Spacing & Elevation", "Icons", "Brand"],
          "Components",
          "AI",
          ["Overview", "Workspace", "Workspace Parts", "Chat Message", "Agent Run Card", "Chain of Thought", "Chat Loader", "Chat Attachment", "Prompt Input", "Prompt Suggestion"],
          "*",
        ],
      },
    },

    backgrounds: {
      options: {
        page: { name: "page", value: "#FAFBFC" },
        surface: { name: "surface", value: "#FFFFFF" },
        "hero (green-200)": { name: "hero (green-200)", value: "#00723F" },
        "footer (green-100)": { name: "footer (green-100)", value: "#0EC971" },
        "ink (offBlack-100)": { name: "ink (offBlack-100)", value: "#022034" }
      }
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },

  initialGlobals: {
    backgrounds: {
      value: "page"
    }
  }
};

export default preview;
