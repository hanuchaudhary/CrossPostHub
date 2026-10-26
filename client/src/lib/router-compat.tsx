import type { ImgHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink, useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";

type LinkProps = Omit<React.ComponentProps<typeof RouterLink>, "to"> & { href: string; replace?: boolean };

export function Link({ href, children, ...props }: LinkProps) {
  if (href.startsWith("javascript:")) {
    return <button type="button" onClick={() => window.history.back()} className={props.className}>{children as ReactNode}</button>;
  }
  return <RouterLink to={href} {...props}>{children}</RouterLink>;
}

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean };
export function Image({ priority: _priority, fill, style, ...props }: ImageProps) {
  return <img {...props} style={fill ? { ...style, width: "100%", height: "100%" } : style} />;
}

export function useRouter() {
  const navigate = useNavigate();
  return { push: (path: string) => navigate(path), replace: (path: string) => navigate(path, { replace: true }), back: () => navigate(-1), refresh: () => window.location.reload() };
}

export function usePathname() { return useLocation().pathname; }
export function useSearchParams() {
  return useRouterSearchParams()[0];
}
export default Link;
