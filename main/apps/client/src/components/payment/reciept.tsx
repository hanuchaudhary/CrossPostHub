import type { ReactNode } from "react";
export function ReceiptTemplate({ children, transaction }: { children?: ReactNode; transaction?: unknown }) { return <div className="rounded-xl border p-4">{children ?? "Receipt"}</div>; }
export default ReceiptTemplate;
