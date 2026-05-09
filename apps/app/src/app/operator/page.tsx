import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, courses, modules, drips } from "@/lib/db";
import { eq, and, lte, isNull } from "drizzle-orm";

export default async function OperatorPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isOperator) {
    redirect("/login");
  }

  const now = new Date();

  // Pending syllabi
  const pendingCourses = await db
    .select({
      id: courses.id,
      goal: courses.goal,
      levelContext: courses.levelContext,
      createdAt: courses.createdAt,
      locale: courses.locale,
    })
    .from(courses)
    .where(eq(courses.status, "syllabus_pending"))
    .orderBy(courses.createdAt)
    .limit(20);

  // Get module counts
  const courseIds = pendingCourses.map((c) => c.id);
  const moduleCounts: Record<string, number> = {};
  const unverifiedCounts: Record<string, number> = {};

  for (const cid of courseIds) {
    const mods = await db
      .select({
        id: modules.id,
        readings: modules.readings,
      })
      .from(modules)
      .where(eq(modules.courseId, cid));

    moduleCounts[cid] = mods.length;
    unverifiedCounts[cid] = mods.filter((m) => {
      const readings = (m.readings ?? []) as { verifiedAt?: string }[];
      return readings.some((r) => !r.verifiedAt);
    }).length;
  }

  return (
    <div className="min-h-screen max-w-prose mx-auto px-6 py-12">
      <header className="mb-12">
        <p className="kicker">Curriculum7 · Studio operator</p>
        <h1 className="font-display font-semibold text-[28px] tracking-tightest text-walnut mt-2">
          Syllabus queue
        </h1>
        <p className="font-serif text-[17px] text-oak mt-2">
          {pendingCourses.length} syllabi awaiting review
        </p>
      </header>

      {pendingCourses.length === 0 ? (
        <div className="note-frame p-8 text-center">
          <p className="font-serif text-[17px] text-oak">
            No syllabi in queue. All clear.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingCourses.map((course) => {
            const deadline = new Date(
              (course.createdAt ?? now).getTime() + 24 * 60 * 60 * 1000
            );
            const overdue = deadline < now;
            const unverified = unverifiedCounts[course.id] ?? 0;

            return (
              <div
                key={course.id}
                className={`note-frame p-6 ${overdue ? "border-marginalia" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`kicker ${overdue ? "text-marginalia" : ""}`}
                      >
                        {overdue ? "Overdue" : "Pending"}
                      </span>
                      <span className="font-mono text-[10px] text-cloud-dark">
                        {new Date(deadline).toLocaleString()}
                      </span>
                    </div>
                    <h2 className="font-display font-semibold text-[21px] tracking-tightest text-walnut leading-snug">
                      {course.goal}
                    </h2>
                    {course.levelContext && (
                      <p className="font-serif text-[15px] text-oak mt-1 line-clamp-2">
                        {course.levelContext}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="kicker">
                      {course.locale?.toUpperCase() ?? "EN"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 hairline" />
                <div className="mt-3 flex items-center gap-4">
                  <span className="font-mono text-[11px] text-sepia">
                    {moduleCounts[course.id] ?? 0} modules
                  </span>
                  {unverified > 0 && (
                    <span className="font-mono text-[11px] text-marginalia uppercase">
                      {unverified} unverified readings
                    </span>
                  )}
                  {unverified === 0 &&
                    (moduleCounts[course.id] ?? 0) > 0 && (
                      <span className="font-mono text-[11px] text-scholar uppercase">
                        All verified
                      </span>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
