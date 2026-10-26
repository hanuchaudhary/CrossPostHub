import React from "react";
import { Button } from "../ui/button";
import {
  IconCircleArrowDownFilled,
  IconLoader,
  IconReload,
} from "@tabler/icons-react";

interface Props {
  store: any;
  downloading: boolean;
  handleExport: () => void;
  handleReset: () => void;
  handleQuickEdit: () => void;
}

export default function BottomToolbar({
  store,
  downloading,
  handleQuickEdit,
  handleReset,
  handleExport,
}: Props) {
  return (
    <div className="border rounded-2xl p-2 space-y-2 bg-secondary/50">
      <div className="flex items-center gap-1.5">
        <Button
          className="flex items-center justify-center gap-2 px-3"
          size={"icon"}
          onClick={handleReset}
        >
          <IconReload />
        </Button>
        <Button
          className="flex w-full items-center justify-center gap-2"
          onClick={handleQuickEdit}
        >
          Quick Edit
        </Button>
      </div>
      <Button className="w-full" onClick={handleExport} disabled={downloading}>
        {!downloading ? (
          <div className="flex items-center justify-center gap-1">
            <IconCircleArrowDownFilled className="h-5 w-5" />
            Download
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <IconLoader className="h-5 w-5 animate-spin" />
            Downloading
          </div>
        )}
      </Button>
    </div>
  );
}
