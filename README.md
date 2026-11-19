# Insights (Zero Childhood Cancer) — Design System · Storybook

A Storybook implementation of the **Insights (ZCC)** design system, built from the Figma file
[Design-System](https://www.figma.com/design/FqEYopO3Pe4JOc9DaOKFMu/Design-System) (originally imported from the
Claude Design project *"Insights (Zero Childhood Cancer) Design System"*).

- **Stack:** React 18 + TypeScript + Vite 8 + Storybook 10, styled with CSS Modules driven by
  the design-system CSS variables in [`src/styles/tokens.css`](src/styles/tokens.css).
- **Icons:** [Lucide](https://lucide.dev) via `lucide-react` — the only UI icon set. Browse all icons in
  *Foundations › Icons*; render them with the `Icon` component (tokens `--insight-icon-size-*`, `--insight-icon-stroke`).
- **Type:** Roboto + Roboto Mono (loaded from Google Fonts in `.storybook/preview-head.html`).

## Getting started

```bash
npm install
npm run storybook      # dev server on http://localhost:6017 (MCP at /mcp)
npm run build-storybook # static build → storybook-static/
npm run typecheck       # tsc --noEmit
npx vitest --run        # every story as a test in headless Chromium (+ a11y checks)
```

## What's inside

### Foundations
Colors (7-step hue ramps + neutrals), Typography (Roboto scale, weights), Spacing &
Elevation (radii, shadows, motion curve), Icons (searchable Lucide library + guidelines), Brand (logo, mark, principles).

### Components
- **Actions:** Button · IconButton · Fab
- **Icon:** Icon (Lucide wrapper with size / tone tokens)
- **Inputs:** Input · Textarea · Select (+ ClassSelect) · FileUpload · Checkbox (+ CheckboxRow) · Radio ·
  Switch (+ YesNoSwitch) · Slider · OtpInput · NumberInput · Calendar
- **Display:** Chip · Badge (+ StatusBadge, CountBadge) · Avatar (+ AvatarGroup, AvatarStatus) · Divider ·
  Card · FeatureCard · AudienceCard · StatTile · Table · Typography
- **Feedback:** Tooltip · Snackbar · Toast · AlertBanner · ProgressBar (+ CircularProgress) · Popover
- **Structure & navigation:** Modal (+ ConfirmModal) · Accordion · Stepper · Tabs · Pagination · TopNav ·
  Navigation (NavRow, Sidebar, NotificationPanel)
- **Collaboration:** Conversation · TextEditor
- **AI** (`src/components/AI`, from the ZAK prototype — Figma `GyEuTla6grBcuq1FKJ49LA`): ChatMessage (+ ChatCallout,
  ChatTaskStatus, ChatMessageMeta, ChatAgentChip) · ChainOfThought (steps + stages timeline) · ChatLoader ·
  ChatAttachment (+ ChatAttachmentList) · PromptInput (+ PromptInputChip, PromptInputBanner) · PromptSuggestion
  (+ PromptSuggestions) · shared AgentAvatar · ChatAgentCard / ChatAgentHeader
- **AI workspace:** WorkspaceLayout (sidebar · canvas · chat) · WorkspaceSidebar (+ WorkspaceSearch, WorkspaceNavItem,
  WorkspaceNavSection, WorkspaceCreateRow, WorkspaceUser) · Canvas (+ CanvasHeader, CanvasSection, CanvasFacts / CanvasFact,
  CanvasOutput, CanvasStats / CanvasStat, CanvasInsight, CanvasActions) · CanvasBarChart · ChatPanel · WorkspacePanel ·
  SourceIcon / SourceStack / SourceItem · RoutineItem / RoutineList · AgentRosterItem · SpaceCard

## Token source of truth

`src/styles/tokens.css` mirrors the Figma Foundation variables (`--insight-color-*`, `--insight-spacing-*`,
`--insight-radius-*`, `--insight-type-*`, `--insight-shadow-*`, `--insight-components-button-*`). Use those names in
new code. The short `--c-*` / `--fg-*` / `--r-*` names at the bottom of the file are legacy aliases kept for older
components. Component-specific Figma tokens that aren't global are defined locally at the top of each component's
`.module.css`. Never hard-code new hues outside the ramp.

## Design principles (short version)

- Greens carry every action; yellow is the primary CTA on dark surfaces; magenta &
  turquoise belong to the brand mark.
- Sentence case everywhere (Title Case only for proper nouns / personae).
- Buttons: 12px corners at Medium (48px), 8px at Small (32px). Cards lift on hover: 1.5px grey → 3px green border + green glow.
- One easing curve: `cubic-bezier(0.19, 1, 0.22, 1)`. No bounces, springs or parallax.
