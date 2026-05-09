import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : "";
  const verify = params.verify === "1";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="note-frame p-8">
          <p className="kicker">Curriculum7</p>
          <div className="eyebrow-rule" />
          <h1 className="font-display font-semibold text-[28px] tracking-tightest leading-tight text-walnut">
            Sign in
          </h1>
          <p className="mt-4 font-serif text-[17px] text-oak leading-relaxed">
            We&rsquo;ll send a magic link to your email. No password, no
            friction.
          </p>

          {verify && (
            <div className="mt-6 p-4 bg-vellum border border-gilt">
              <p className="font-serif text-[15px] text-oak">
                Check your email. We sent you a sign-in link.
              </p>
            </div>
          )}

          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn("email", {
                email: formData.get("email") as string,
                redirectTo: "/dashboard",
              });
            }}
            className="mt-8 space-y-4"
          >
            <div>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={email}
                placeholder="mara@example.com"
                className="w-full bg-parchment border border-walnut/25 text-walnut font-serif text-[17px] px-4 py-3 focus:outline-none focus:border-gilt"
                style={{ borderRadius: 0 }}
              />
            </div>
            <button type="submit" className="btn w-full">
              Send magic link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
