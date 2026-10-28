import type { ProfileDraft } from "@/lib/types";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { updateProfile, errorMessage } from "@/lib/api";
import { AVATARS } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LabelInput } from "@/components/ui/label-input";
import { Icon } from "@/components/ui/icon";

export function AccountSettings() {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;
  const [draft, setDraft] = useState<ProfileDraft | null>(null),
    [saving, setSaving] = useState(false);
  const name = draft?.name ?? user?.name ?? "",
    image = draft?.image ?? user?.image ?? "";
  const reduced = useReducedMotion();
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name.");
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      const result = await updateProfile({
        name: trimmed,
        image: image || null,
      });
      if (result.error)
        throw new Error(result.error.message || "Could not save profile");
      await refetch();
      setDraft(null);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <section aria-labelledby="profile-heading" className="pb-10">
        <form onSubmit={save}>
          <fieldset disabled={saving || !user}>
            <div className="flex flex-wrap items-center gap-5">
              <Avatar className="size-20">
                <AvatarImage src={image} alt={name || "Your avatar"} />
                <AvatarFallback className="text-2xl">
                  {name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 id="profile-heading" className="font-medium">
                  Choose an avatar
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick a character that feels like you.
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-12">
              {AVATARS.map((avatar) => (
                <motion.div
                  key={avatar.name}
                  whileHover={reduced ? undefined : { y: -4 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDraft({ name, image: avatar.url })}
                    aria-label={`Choose ${avatar.name} avatar`}
                    aria-pressed={image === avatar.url}
                    className={cn(
                      "relative aspect-square h-auto w-full overflow-hidden rounded-2xl border-2 p-0 cursor-pointer",
                      image === avatar.url
                        ? "border-foreground"
                        : "border-transparent",
                    )}
                  >
                    <Avatar className="size-full rounded-none">
                      <AvatarImage
                        src={avatar.url}
                        alt=""
                        loading="lazy"
                        className="rounded-none object-cover"
                      />
                      <AvatarFallback className="rounded-none text-xs">
                        {avatar.name}
                      </AvatarFallback>
                    </Avatar>
                    {image === avatar.url && (
                      <span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-tl-lg bg-foreground text-background">
                        <Icon name="check" size={13} />
                      </span>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 space-y-2">
              <LabelInput
                id="profile-name"
                name="name"
                label="Display name"
                type="text"
                value={name}
                onChange={(event) =>
                  setDraft({ image, name: event.target.value })
                }
                autoComplete="name"
                maxLength={80}
                required
              />
              <LabelInput
                id="profile-email"
                label="Email address"
                type="email"
                value={user?.email ?? ""}
                readOnly
                isDisabled
                disabled
              />
            </div>
            <div className="mt-7 flex justify-end">
              <Button
                type="submit"
                disabled={saving || !user}
                className="h-auto rounded-full bg-linear-to-b from-neutral-600 to-neutral-800 px-4 py-1.75 text-sm text-white shadow-[0_2px_8px_rgba(23,23,23,0.25),inset_0_1.5px_0_rgba(255,255,255,0.25)] dark:from-white dark:to-neutral-200 dark:text-neutral-800"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </fieldset>
        </form>
      </section>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Link className="underline underline-offset-4" to="/connections">
          Manage connected channels
        </Link>
        {user && !user.emailVerified && (
          <Link
            className="underline underline-offset-4"
            to={`/verify?email=${encodeURIComponent(user.email)}`}
          >
            Verify your email address
          </Link>
        )}
      </div>
    </>
  );
}
