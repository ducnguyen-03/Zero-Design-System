import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "./Calendar";
import type { CalendarSize, DateRange } from "./Calendar";
import { Section, Stage, StateCell } from "../../storybook/StoryLayout";

const TODAY = new Date(2026, 8, 30); // 30 Sep 2026 — fixed so stories are stable

type PlaygroundArgs = {
  size: CalendarSize;
  mode: "single" | "range";
  numberOfMonths: 1 | 2;
  weekStartsOn: 0 | 1;
  showOutsideDays: boolean;
  locale: string;
};

const meta: Meta<PlaygroundArgs> = {
  title: "Components/Calendar",
  parameters: {
    docs: {
      description: {
        component:
          "Month grid built on native `Date` (no date library). Single or range selection, month navigation, and full keyboard support: ←/→ ±1 day, ↑/↓ ±1 week, Home/End start/end of week, PageUp/PageDown ±1 month (Shift = ±1 year), Enter/Space select. Sizes map to the Figma Calendar Atoms (Small 32px, Medium 36px, Large 46px date cells). `numberOfMonths={2}` gives the two-up Advanced Date Picker layout.",
      },
    },
  },
  args: {
    size: "md",
    mode: "single",
    numberOfMonths: 1,
    weekStartsOn: 0,
    showOutsideDays: true,
    locale: "en-AU",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    mode: { control: "inline-radio", options: ["single", "range"] },
    numberOfMonths: { control: "inline-radio", options: [1, 2] },
    weekStartsOn: { control: "inline-radio", options: [0, 1] },
  },
};
export default meta;

type Story = StoryObj<PlaygroundArgs>;

function SingleDemo(props: Omit<PlaygroundArgs, "mode"> & { initial?: Date | null }) {
  const { initial = null, ...rest } = props;
  const [value, setValue] = useState<Date | null>(initial);
  return (
    <Calendar
      {...rest}
      today={TODAY}
      defaultMonth={TODAY}
      value={value}
      onChange={setValue}
      aria-label="Choose a date"
    />
  );
}

function RangeDemo(props: Omit<PlaygroundArgs, "mode"> & { initial?: DateRange }) {
  const { initial = { start: null, end: null }, ...rest } = props;
  const [value, setValue] = useState<DateRange>(initial);
  return (
    <Calendar
      {...rest}
      mode="range"
      today={TODAY}
      defaultMonth={TODAY}
      value={value}
      onChange={setValue}
      aria-label="Choose a date range"
    />
  );
}

export const Playground: Story = {
  render: ({ mode, ...args }) =>
    mode === "range" ? <RangeDemo {...args} /> : <SingleDemo {...args} />,
};

const SIZES: { key: CalendarSize; label: string }[] = [
  { key: "sm", label: "Small" },
  { key: "md", label: "Medium" },
  { key: "lg", label: "Large" },
];
const base = { numberOfMonths: 1 as const, weekStartsOn: 0 as const, showOutsideDays: true, locale: "en-AU" };

/** Figma Size × Type grid. Atoms: Week Day, Date Active, Date Selected, Date Period, Date Inactive (outside / disabled days). */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div>
      <Section title="Type=Simple" description="Single selection; today carries a hairline ring and aria-current=&quot;date&quot;.">
        <Stage gap={32}>
          {SIZES.map((s) => (
            <StateCell key={s.key} label={s.label}>
              <SingleDemo {...base} size={s.key} initial={new Date(2026, 8, 18)} />
            </StateCell>
          ))}
        </Stage>
      </Section>
      <Section title="Type=Range Selection" description="Endpoints use Date Selected; days between use Date Period. Hovering previews the range while choosing the end.">
        <Stage gap={32}>
          {SIZES.map((s) => (
            <StateCell key={s.key} label={s.label}>
              <RangeDemo
                {...base}
                size={s.key}
                initial={{ start: new Date(2026, 8, 8), end: new Date(2026, 8, 17) }}
              />
            </StateCell>
          ))}
        </Stage>
      </Section>
      <Section title="Date Inactive" description="Outside-month days and days outside minDate / maxDate.">
        <Stage gap={32}>
          <StateCell label="minDate = 10 Sep, maxDate = 25 Sep">
            <Calendar
              size="md"
              today={TODAY}
              defaultMonth={TODAY}
              minDate={new Date(2026, 8, 10)}
              maxDate={new Date(2026, 8, 25)}
              aria-label="Constrained calendar"
            />
          </StateCell>
        </Stage>
      </Section>
      <Section title="Size=Advanced Date Picker Modal, Type=Complex" description="Two months side by side, range selection, elevated surface.">
        <RangeDemo
          {...base}
          size="md"
          numberOfMonths={2}
          initial={{ start: new Date(2026, 8, 24), end: new Date(2026, 9, 6) }}
        />
      </Section>
    </div>
  ),
};
