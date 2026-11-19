import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { InsightsDashboard } from "../../storybook/insightsPage/InsightsDashboard";
import type { InsightsPageView } from "../../storybook/insightsPage/InsightsDashboard";
import { SidebarDatasetAccess } from "../Navigation/SidebarDatasetAccess";
import { AccessTierModal } from "../Insights/AccessTiers";
import { ACCESS_CAPABILITIES, ACCESS_NOTES, ACCESS_TIERS, DATASET_ACCESS } from "../../storybook/insightsAccess";
import { TERMS, TERMS_INTRO, TERMS_SUBTITLE, WELCOME, insightsTourSteps } from "../../storybook/insightsOnboarding";
import { OnboardingTour } from "./OnboardingTour";
import type { TourTheme } from "./OnboardingTour";
import { TOUR_ICONS, TourCard } from "./TourCard";
import type { TourIconName } from "./TourCard";
import { TOUR_ILLUSTRATIONS, TourIllustration } from "./TourIllustrations";
import { TourHelpMenu, TourSignedOut, TourSkipConfirm, TourTerms, TourWelcome } from "./TourModals";

const meta: Meta = {
  title: "Components/Onboarding Tour",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "First-run onboarding for Insights (Claude Design *Insights Onboarding*), in the order a new user meets it:\n\n" +
          "1. **`TourTerms`** — the data access agreement. Accept unlocks once the terms are scrolled to the end and the confirmation is ticked. Decline → **`TourSignedOut`**.\n" +
          "2. **`TourWelcome`** — the invitation: a look at the product, what the tour covers, Start tour or Skip tour.\n" +
          "3. **`OnboardingTour`** — the steps over the real screen. [driver.js](https://driverjs.com) dims the page, cuts out the target with a yellow ring and places the card; " +
          "each card is a **`TourCard`** in one of three layouts — **illustrated** (picture header, `TourIllustration`), **icon** (`TOUR_ICONS`) or **text** — on a light or dark card.\n" +
          "4. **`TourSkipConfirm`** — closing before the last step asks *Skip the tour?*.\n" +
          "5. **`TourHelpMenu`** — Help and support in the sidebar replays the tour or reopens the agreement.\n\n" +
          "Mark targets with `data-tour=\"…\"`. A selector that matches several elements is framed as one. `placement: \"inside\"` pins the card to the corner of a whole panel. ← → move, Escape asks to skip.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;
type ThemeArgs = { theme: TourTheme; showMedia: boolean };

/* ─────────────────────────── Demo screen ─────────────────────────── */

/* The tour runs over the full Insights page and its tabs (Figma Insights-UI 15230:84687). */

const fmtAU = (n: number) => n.toLocaleString("en-AU");

type Phase = "terms" | "declined" | "welcome" | "tour" | "done";

function Flow({ startAt = "terms", theme = "illustrated", showMedia = true }: { startAt?: Phase; theme?: TourTheme; showMedia?: boolean }) {
  const [phase, setPhase] = useState<Phase>(startAt);
  const [view, setView] = useState<InsightsPageView>("summary");
  const [help, setHelp] = useState<DOMRect | null>(null);
  const [tiersOpen, setTiersOpen] = useState(false);
  const steps = useMemo(() => insightsTourSteps(setView), []);
  const { participants } = DATASET_ACCESS;
  return (
    <div style={{ height: "100vh", minHeight: 640 }}>
      <InsightsDashboard
        view={view}
        onViewChange={setView}
        onHelp={(r) => setHelp((h) => (h ? null : r))}
        access={
          <SidebarDatasetAccess
            data-tour="access"
            available={DATASET_ACCESS.available}
            total={DATASET_ACCESS.total}
            availableLabel={`${fmtAU(participants.available)} participants`}
            lockedLabel={`${fmtAU(participants.total - participants.available)} no access`}
            onShowTiers={() => setTiersOpen(true)}
            onRequest={() => setTiersOpen(true)}
          />
        }
      >
        {help ? (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 899 }} onClick={() => setHelp(null)} />
            <TourHelpMenu
              className=""
              onReplay={() => {
                setHelp(null);
                setPhase("tour");
              }}
              onTerms={() => {
                setHelp(null);
                setPhase("terms");
              }}
              onFaq={() => setHelp(null)}
            />
            <style>{`[role="menu"][aria-label="Help and support"]{position:fixed;z-index:900;left:${help.right + 12}px;bottom:${Math.max(8, window.innerHeight - help.bottom)}px}`}</style>
          </>
        ) : null}
        <AccessTierModal
          open={tiersOpen}
          onClose={() => setTiersOpen(false)}
          tiers={ACCESS_TIERS}
          capabilities={ACCESS_CAPABILITIES}
          notes={ACCESS_NOTES}
          onSelectTier={() => setTiersOpen(false)}
        />
        <TourTerms
          open={phase === "terms"}
          subtitle={TERMS_SUBTITLE}
          intro={TERMS_INTRO}
          sections={TERMS}
          onDownload={() => {}}
          onAccept={() => setPhase("welcome")}
          onDecline={() => setPhase("declined")}
        />
        <TourSignedOut open={phase === "declined"} onSignIn={() => setPhase("terms")} />
        <TourWelcome
          open={phase === "welcome"}
          {...WELCOME}
          image={<img src="/assets/welcome-summary.png" alt="Insights summary dashboard" />}
          onStart={() => setPhase("tour")}
          onSkip={() => setPhase("done")}
        />
        <OnboardingTour open={phase === "tour"} steps={steps} theme={theme} showMedia={showMedia} onClose={() => setPhase("done")} />
      </InsightsDashboard>
    </div>
  );
}

/* ─────────────────────────── Docs helpers ─────────────────────────── */

const caption: CSSProperties = { margin: "0 0 8px", font: "500 13px/18px var(--insight-font-family-sans)", color: "var(--spec-caption, var(--insight-color-grey-200))" };
const note: CSSProperties = { margin: "8px 0 0", maxWidth: 420, font: "400 12px/18px var(--insight-font-family-sans)", color: "var(--spec-note, var(--insight-color-grey-100))" };

function Specimen({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={caption}>{label}</figcaption>
      {children}
      {hint ? <p style={note}>{hint}</p> : null}
    </figure>
  );
}

function Board({ children, dark, center }: { children: ReactNode; dark?: boolean; center?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "40px 32px",
        alignItems: "flex-start",
        justifyContent: center ? "center" : undefined,
        padding: 32,
        boxSizing: "border-box",
        background: dark ? "rgb(2 32 52 / 0.6)" : "var(--insight-color-grey-10)",
        ...(dark ? { "--spec-caption": "rgb(255 255 255 / 0.9)", "--spec-note": "rgb(255 255 255 / 0.75)" } : {}),
      } as CSSProperties}
    >
      {children}
    </div>
  );
}

const SAMPLE = {
  title: "Search across the portal",
  body: "Search for diagnoses, genes and variants from anywhere. Press ⌘K to open search from the keyboard.",
};
const noop = () => {};
const nav = { onNext: noop, onBack: noop, onSkip: noop, onClose: noop };

/* Stories that take over the screen (portalled modals, a running driver.js tour) get their own
   iframe on the Docs page; otherwise every one of them would cover the whole page at once. */
const FRAMED = { docs: { story: { inline: false, height: "720px" } } };

/** What each step points at, in the product's words. */
const AREAS: Record<string, string> = {
  nav: "View tabs",
  search: "Search",
  kpi: "Metric cards",
  charts: "Cohort charts",
  participants: "Participants view",
  pdx: "PDX models view",
  monitoring: "Study monitoring view",
  molecular: "Molecular view",
  filters: "Filter rail",
  saved: "Saved queries (sidebar)",
  access: "Dataset access (sidebar)",
  request: "Request data access",
  help: "Help and support (sidebar)",
};
const PLACEMENT: Record<string, string> = {
  bottom: "below it",
  top: "above it",
  left: "on its left",
  right: "on its right",
  inside: "in its bottom-right corner",
};

/* ─────────────────────────── Stories ─────────────────────────── */

/** The data access agreement. Accept stays disabled until the terms are read to the end and the box is ticked. */
export const Terms: Story = {
  name: "1 · Terms",
  render: () => (
    <Board dark center>
      <TourTerms inline open subtitle={TERMS_SUBTITLE} intro={TERMS_INTRO} sections={TERMS} onDownload={noop} onAccept={noop} onDecline={noop} />
    </Board>
  ),
  play: async ({ canvasElement }) => {
    const accept = await within(canvasElement).findByRole("button", { name: "Accept and continue" });
    await expect(accept).toBeDisabled();
  },
};

/** After "Decline and sign out". */
export const SignedOut: Story = {
  name: "1b · Declined · signed out",
  render: () => (
    <Board center>
      <TourSignedOut inline open onSignIn={noop} />
    </Board>
  ),
};

/** The invitation before the tour. */
export const Welcome: Story = {
  name: "2 · Welcome",
  render: () => (
    <Board dark center>
      <TourWelcome inline open {...WELCOME} image={<img src="/assets/welcome-summary.png" alt="Insights summary dashboard" />} onStart={noop} onSkip={noop} />
    </Board>
  ),
};

/** The three step layouts, light and dark. The layout follows what the step carries: a picture, an icon, or neither. */
export const StepLayouts: Story = {
  name: "3 · Step card · layouts",
  render: () => (
    <Board>
      <Specimen label="Illustrated · picture header" hint="theme illustrated. 12px inset, 180px picture, 16px title, count without dots, white close button.">
        <TourCard {...SAMPLE} {...nav} step={1} total={14} illustration={<TourIllustration name="search" />} />
      </Specimen>
      <Specimen label="Icon · light" hint="theme light. 48px green disc, 18px title, dots in green.">
        <TourCard {...SAMPLE} {...nav} step={1} total={14} icon="search" />
      </Specimen>
      <Specimen label="Icon · dark" hint="theme dark. Bare yellow glyph, white pill for Next, dots in yellow.">
        <TourCard {...SAMPLE} {...nav} step={1} total={14} icon="search" tone="dark" />
      </Specimen>
      <Specimen label="Text only · light" hint="showMedia={false}, or a step with no icon.">
        <TourCard {...SAMPLE} {...nav} step={1} total={14} />
      </Specimen>
      <Specimen label="Text only · dark">
        <TourCard {...SAMPLE} {...nav} step={1} total={14} tone="dark" />
      </Specimen>
    </Board>
  ),
};

/** First, middle and last step: Skip tour → Back, Next → Start exploring, the dots fill in. */
export const StepPositions: Story = {
  name: "3 · Step card · first, middle, last",
  render: () => (
    <Board>
      {(["light", "dark"] as const).map((tone) =>
        [0, 6, 12].map((step) => (
          <Specimen key={`${tone}${step}`} label={`${tone === "dark" ? "Dark" : "Light"} · step ${step + 1} of 14`}>
            <TourCard
              {...nav}
              tone={tone}
              step={step}
              total={14}
              icon={step === 12 ? "done" : step === 0 ? "views" : "pdx"}
              title={step === 0 ? "Explore data in one place" : step === 12 ? "You are ready to explore" : "PDX models"}
              body={
                step === 0
                  ? "Insights is organised into four views: a summary of the cohort, participants, PDX models and molecular variant detail."
                  : step === 12
                    ? "Replay this tour or find FAQs at any time from Help and support in the sidebar."
                    : "See which patient-derived xenograft models are available and how they are validated, then open the model list."
              }
            />
          </Specimen>
        )),
      )}
    </Board>
  ),
};

/** The arrow points at the target from whichever side the card sits on. In a running tour driver.js draws it. */
export const StepArrows: Story = {
  name: "3 · Step card · arrow",
  render: () => (
    <Board dark>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Specimen key={side} label={`Card ${side === "top" ? "below" : side === "bottom" ? "above" : side === "left" ? "right of" : "left of"} its target · arrow ${side}`}>
          <TourCard {...SAMPLE} {...nav} step={1} total={14} icon="search" arrow={side} arrowOffset={side === "top" || side === "bottom" ? 60 : 40} />
        </Specimen>
      ))}
    </Board>
  ),
};

/** Every step of the Insights tour, as the illustrated theme shows it. */
export const AllSteps: StoryObj<ThemeArgs> = {
  name: "3 · All 14 steps",
  argTypes: { theme: { control: "inline-radio", options: ["illustrated", "light", "dark"] } },
  args: { theme: "illustrated", showMedia: true },
  render: (args) => {
    const steps = insightsTourSteps(noop);
    const theme = args.theme;
    return (
      <Board>
        {steps.map((s, i) => (
          <Specimen
            key={i}
            label={`Step ${i + 1} · ${AREAS[s.target.replace(/\[data-tour="(.+)"\]/, "$1")] ?? s.target}`}
            hint={`Highlights ${s.target} · card ${PLACEMENT[s.placement ?? "bottom"]}`}
          >
            <TourCard
              {...nav}
              title={s.title}
              body={s.body}
              step={i}
              total={steps.length}
              tone={theme === "dark" ? "dark" : "light"}
              illustration={theme === "illustrated" ? s.illustration : undefined}
              icon={theme === "illustrated" ? undefined : s.icon}
            />
          </Specimen>
        ))}
      </Board>
    );
  },
};

/** The picture headers. `<TourIllustration name="…" />` — 420 × 180, drawn from the product's own parts. */
export const Illustrations: Story = {
  name: "Parts · illustrations",
  render: () => (
    <Board>
      {TOUR_ILLUSTRATIONS.map((name) => (
        <Specimen key={name} label={`"${name}"`}>
          <div style={{ position: "relative", width: 420, height: 180, borderRadius: 12, overflow: "hidden", background: "var(--insight-color-grey-30)" }}>
            <TourIllustration name={name} />
          </div>
        </Specimen>
      ))}
    </Board>
  ),
};

/** The step icons. Pass a name as `icon`, or any Lucide node. */
export const Icons: Story = {
  name: "Parts · icons",
  render: () => (
    <Board>
      {(Object.keys(TOUR_ICONS) as TourIconName[]).map((name) => {
        const Glyph = TOUR_ICONS[name];
        return (
          <Specimen key={name} label={`"${name}"`}>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", background: "var(--insight-color-green-10)", color: "var(--insight-color-green-200)" }}>
                <Glyph size={28} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 12, background: "var(--insight-color-off-black-100)", color: "var(--insight-color-yellow-100)" }}>
                <Glyph size={28} strokeWidth={1.75} aria-hidden="true" />
              </span>
            </div>
          </Specimen>
        );
      })}
    </Board>
  ),
};

/** Closing the tour before its last step (✕, Escape, Skip tour) asks first. */
export const SkipConfirm: Story = {
  name: "4 · Skip confirmation",
  render: () => (
    <Board dark center>
      <TourSkipConfirm inline open onContinue={noop} onSkip={noop} />
    </Board>
  ),
};

/** Help and support in the sidebar: replay the tour, reopen the agreement, FAQs. Select it in the Flow story to see it in place. */
export const HelpMenu: Story = {
  name: "5 · Help menu",
  render: () => (
    <Board>
      <TourHelpMenu onReplay={noop} onTerms={noop} onFaq={noop} />
    </Board>
  ),
};

/** The whole first login: Terms → Welcome → 13-step tour over the Insights screen → Help and support replays it. Decline shows the signed-out screen. */
export const FullFlow: StoryObj<ThemeArgs> = {
  name: "Flow · first login",
  argTypes: {
    theme: { control: "inline-radio", options: ["illustrated", "light", "dark"] },
    showMedia: { control: "boolean", name: "Show icon / picture" },
  },
  args: { theme: "illustrated", showMedia: true },
  parameters: FRAMED,
  render: (args) => <Flow theme={args.theme} showMedia={args.showMedia} />,
};

/** The running tour, one per theme (canvas only — the Docs page shows it through the Flow story). ← → to move, Escape to skip. */
export const TourIllustrated: Story = {
  tags: ["!autodocs"],
  name: "Tour · illustrated",
  render: () => <Flow startAt="tour" theme="illustrated" />,
  play: async () => {
    const body = within(document.body);
    await expect(await body.findByRole("heading", { name: "Explore data in one place" })).toBeInTheDocument();
    await userEvent.click(body.getByRole("button", { name: "Next" }));
    await expect(await body.findByRole("heading", { name: "Search across the portal" })).toBeInTheDocument();
  },
};

export const TourLight: Story = {
  tags: ["!autodocs"],
  name: "Tour · icon light",
  render: () => <Flow startAt="tour" theme="light" />,
};

export const TourDark: Story = {
  tags: ["!autodocs"],
  name: "Tour · icon dark",
  render: () => <Flow startAt="tour" theme="dark" />,
};

export const TourText: Story = {
  tags: ["!autodocs"],
  name: "Tour · text only",
  render: () => <Flow startAt="tour" theme="light" showMedia={false} />,
};
