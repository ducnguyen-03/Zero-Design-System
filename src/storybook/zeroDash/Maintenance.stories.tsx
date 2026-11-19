import { useState } from "react";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../components/Button/Button";
import {
  DEFAULT_MAINTENANCE_WINDOW,
  MaintenanceNoticeModal,
  MaintenancePage,
  MaintenanceSnackbar,
} from "./Maintenance";

const meta: Meta = {
  title: "ZeroDash/Maintenance",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Maintenance UI for ZeroDash. Presentational: the app shell owns the `MaintenanceStage` " +
          "(`off → scheduled → imminent → offline`) and renders the yellow alert bar plus these pieces. " +
          "`scheduled` may open the notice modal; `imminent` slides in the snackbar; `offline` replaces the app with the page.",
      },
      story: { inline: false, iframeHeight: 720 },
    },
  },
};
export default meta;
type Story = StoryObj;

const Backdrop = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: "100vh", background: "var(--insight-color-grey-10)", padding: 24, boxSizing: "border-box" }}>
    {children}
  </div>
);

/** 10-minute warning (imminent stage). Fixed bottom-left; dismiss and re-open with the button. */
export const Snackbar: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <Backdrop>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={open}>
          Show snackbar
        </Button>
        <MaintenanceSnackbar open={open} window={DEFAULT_MAINTENANCE_WINDOW} onClose={() => setOpen(false)} />
      </Backdrop>
    );
  },
};

/** With the optional "View details" action, which opens the notice modal. */
export const SnackbarWithDetails: Story = {
  name: "Snackbar with details",
  render: function Render() {
    const [open, setOpen] = useState(true);
    const [notice, setNotice] = useState(false);
    return (
      <Backdrop>
        <MaintenanceSnackbar
          open={open}
          onClose={() => setOpen(false)}
          onDetails={() => {
            setOpen(false);
            setNotice(true);
          }}
        />
        <MaintenanceNoticeModal open={notice} onClose={() => setNotice(false)} />
      </Backdrop>
    );
  },
};

/** "Scheduled maintenance" notice shown when the scheduled stage begins. */
export const NoticeModal: Story = {
  name: "Notice modal",
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <Backdrop>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Show notice
        </Button>
        <MaintenanceNoticeModal open={open} window={DEFAULT_MAINTENANCE_WINDOW} onClose={() => setOpen(false)} />
      </Backdrop>
    );
  },
};

/** Full-screen offline page, light theme. */
export const PageLight: Story = {
  name: "Maintenance page · light",
  render: () => <MaintenancePage window={DEFAULT_MAINTENANCE_WINDOW} theme="light" />,
};

/** Full-screen offline page, dark theme. */
export const PageDark: Story = {
  name: "Maintenance page · dark",
  render: () => <MaintenancePage window={DEFAULT_MAINTENANCE_WINDOW} theme="dark" />,
};
