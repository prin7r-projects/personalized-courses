import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, courses } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.userId!, session.user.id))
    .orderBy(desc(courses.createdAt))
    .limit(20);

  return (
    <div className="min-h-screen max-w-prose mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-12">
        <div>
          <p className="kicker">Curriculum7</p>
          <h1 className="font-display font-semibold text-[28px] tracking-tightest text-walnut mt-2">
            Your courses
          </h1>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="btn-ghost text-sm">
            Sign out
          </button>
        </form>
      </header>

      {userCourses.length === 0 ? (
        <div className="note-frame p-8 text-center">
          <p className="font-serif text-[17px] text-oak">
            No courses yet. When you pay and complete the intake form, your
            course will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userCourses.map((course) => (
            <div key={course.id} className="note-frame p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker">
                    {course.status.replace(/_/g, " ")}
                  </p>
                  <h2 className="font-display font-semibold text-[21px] tracking-tightest text-walnut mt-1 leading-snug line-clamp-2">
                    {course.goal}
                  </h2>
                  {course.levelContext && (
                    <p className="font-serif text-[15px] text-oak mt-2 line-clamp-2">
                      {course.levelContext}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 hairline" />
              <div className="mt-3 flex items-center gap-4">
                <span className="kicker">
                  {course.locale?.toUpperCase() ?? "EN"}
                </span>
                {course.status === "syllabus_pending" && (
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] text-sepia">
                    <span className="ink-dot" /> Awaiting syllabus
                  </span>
                )}
                {course.status === "syllabus_approved" && (
                  <span className="font-mono text-[11px] text-scholar uppercase tracking-ledger">
                    Approved
                  </span>
                )}
                {course.status === "active" && (
                  <span className="font-mono text-[11px] text-gilt uppercase tracking-ledger">
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
