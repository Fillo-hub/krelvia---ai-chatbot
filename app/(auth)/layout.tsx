import { ArrowLeftIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Preview } from "@/components/chat/preview";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-screen bg-sidebar">
      <div className="flex w-full flex-col bg-background p-6 sm:p-10 xl:w-[560px] xl:shrink-0 xl:rounded-r-2xl xl:border-r xl:border-border/50 md:p-14">
        <Link
          className="flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          <ArrowLeftIcon className="size-3.5" />
          Torna alla chat
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <SparklesIcon className="size-5" />
            </div>
            {children}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 flex-col overflow-hidden pl-12 xl:flex">
        <div className="flex items-center gap-2 pt-8 text-[13px] text-muted-foreground">
          <SparklesIcon className="size-4 text-primary" />
          <span className="font-semibold text-foreground">Krelvia</span>
          <span>• Workspace AI &amp; Utility Locale</span>
        </div>
        <div className="flex-1 pt-4">
          <Preview />
        </div>
      </div>
    </div>
  );
}
