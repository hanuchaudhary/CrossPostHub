import { Twitter, Monitor, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

export interface Template {
    id: string;
    name: string;
    icon: ReactNode;
    frame: string;
    contentPosition: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export const templates: Template[] = [
    {
        id: "default",
        name: "Default",
        icon: <Monitor className="h-4 w-4" />,
        frame: "",
        contentPosition: {
            x: 0,
            y: 0,
            width: 800,
            height: 600
        }
    },
    {
        id: "twitter",
        name: "Twitter",
        icon: <Twitter className="h-4 w-4" />,
        frame: "",
        contentPosition: {
            x: 40,
            y: 40,
            width: 1120,
            height: 595
        }
    },
    {
        id: "mobile",
        name: "Mobile",
        icon: <Smartphone className="h-4 w-4" />,
        frame: "",
        contentPosition: {
            x: 0,
            y: 0,
            width: 390,
            height: 844
        }
    }
]; 