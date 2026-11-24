import { Link } from "react-router";

import { AppearanceSettings } from "@/components/account/appearance-settings";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

import { CenterPageLayout } from "../center-page-layout";

export default function SettingsPage() {
  return (
    <CenterPageLayout title="Preferences">
      <div className="space-y-6">
        <AppearanceSettings />
        <section className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-secondary">
              <Icon name="link" />
            </span>
            <div>
              <h2 className="font-medium">Connected channels</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect or disconnect the accounts you publish to.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/connections" />}
          >
            Manage channels <Icon name="arrow" />
          </Button>
        </section>
        <section className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="font-medium">Privacy and terms</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review how your account and publishing data are handled.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/privacy" />}
            >
              Privacy
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/terms" />}
            >
              Terms
            </Button>
          </div>
        </section>
      </div>
    </CenterPageLayout>
  );
}
