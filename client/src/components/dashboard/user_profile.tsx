import { authClient } from "@/lib/auth.client";
export function UserProfile() {
  const { data } = authClient.useSession();
  return <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-secondary" /><span>{data?.user?.name ?? data?.user?.email ?? "Account"}</span></div>;
}
export default UserProfile;
