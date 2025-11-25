import  RichTextEditor  from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { GraduationCap, NotebookPen, Settings2 } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const navigation: readonly NavItem[] = [
  {
    id: "notes",
    label: "Notes",
    description: "Organize topics and snippets in folders.",
    icon: NotebookPen,
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Track spaced-repetition sessions at a glance.",
    icon: GraduationCap,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Manage preferences and connected devices.",
    icon: Settings2,
  },
] as const;

const activeItem = navigation[0];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40 md:flex-row">
      <aside className="w-full border-b bg-background md:sticky md:top-0 md:flex md:h-screen md:w-[250px] md:flex-col md:border-b-0 md:border-r">
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-content-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
              M
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Memoloop
              </p>
              <p className="text-lg font-semibold text-foreground">Dashboard</p>
            </div>
          </div>

          <nav aria-label="Main" className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeItem.id;

              return (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "w-full justify-start gap-3 rounded-lg px-3 py-5 text-base transition",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Focus tip</p>
            <p>Batch your note reviews into 25-minute loops.</p>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
          <header>
            <p className="text-sm text-muted-foreground">Overview</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Daily learning snapshot
            </h1>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            {navigation.map((item) => (
              <article
                key={`card-${item.id}`}
                className="rounded-2xl border bg-background p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{item.label}</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Updated 2h ago</span>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    View details
                  </Button>
                </div>
              </article>
            ))}
          </section>

          <section className="rounded-2xl border bg-background p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Upcoming loops</h2>
            <div className="mt-4 grid gap-3 text-sm">
              {["Biology chapters", "Design patterns", "Interview prep"].map(
                (loop) => (
                  <div
                    key={loop}
                    className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3"
                  >
                    <span className="font-medium">{loop}</span>
                    <span className="text-muted-foreground">Due today</span>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Loop 笔记</h2>
                <p className="text-sm text-muted-foreground">
                  浮动工具栏会在光标附近出现
                </p>
              </div>
              <span className="hidden text-xs text-muted-foreground md:inline">
                支持加粗 / 斜体 / H1-H3
              </span>
            </div>
            <div className="mt-4">
              <RichTextEditor />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
