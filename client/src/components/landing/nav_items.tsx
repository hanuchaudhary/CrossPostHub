
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../tools/theme_toggle";
import { Link } from "react-router";


export default function NavItems() {
  return (
    <nav className="flex items-center space-x-3">
      <Link to={"/signin"}>
        <Button className="rounded-xl" size="sm">
          Try it Free
        </Button>
      </Link>
      <Link to={"/edit/code"}>
        <Button className="rounded-xl" size="sm">
          Editor
        </Button>
      </Link>
      <ThemeToggle />
    </nav>
  );
}
