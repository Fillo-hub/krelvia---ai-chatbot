"use client";

import {
  PanelLeftIcon,
  PenSquareIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from "@/components/chat/sidebar-history";
import { SidebarUserNav } from "@/components/chat/sidebar-user-nav";
import { QuickToolsDialog } from "@/components/tools/quick-tools-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const { mutate } = useSWRConfig();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const closeMobile = useCallback(() => {
    setOpenMobile(false);
  }, [setOpenMobile]);

  const handleToggleSidebar = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const handleNewChat = useCallback(() => {
    setOpenMobile(false);
    router.push("/");
  }, [router, setOpenMobile]);

  const handleShowDeleteAllDialog = useCallback(() => {
    setShowDeleteAllDialog(true);
  }, []);

  const handleDeleteAll = useCallback(() => {
    setShowDeleteAllDialog(false);
    router.replace("/");
    mutate(unstable_serialize(getChatHistoryPaginationKey), [], {
      revalidate: false,
    });

    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history`, {
      method: "DELETE",
    });

    toast.success("Tutte le chat sono state eliminate");
  }, [mutate, router]);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="pb-2 pt-3">
          <SidebarMenu>
            <SidebarMenuItem className="flex flex-row items-center justify-between gap-2">
              <div className="group/logo relative flex items-center gap-2">
                <SidebarMenuButton
                  asChild
                  className="size-8 !px-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground group-data-[collapsible=icon]:group-hover/logo:opacity-0"
                  tooltip="Krelvia"
                >
                  <Link href="/" onClick={closeMobile}>
                    <SparklesIcon className="size-4" />
                  </Link>
                </SidebarMenuButton>
                <Link
                  className="flex flex-col leading-none group-data-[collapsible=icon]:hidden"
                  href="/"
                  onClick={closeMobile}
                >
                  <span className="font-semibold text-sm tracking-tight text-foreground">
                    Krelvia
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Workspace Locale
                  </span>
                </Link>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      aria-label="Apri barra laterale"
                      className="pointer-events-none absolute inset-0 size-8 opacity-0 group-data-[collapsible=icon]:pointer-events-auto group-data-[collapsible=icon]:group-hover/logo:opacity-100"
                      onClick={handleToggleSidebar}
                    >
                      <PanelLeftIcon className="size-4" />
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="hidden md:block" side="right">
                    Apri barra laterale
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <SidebarTrigger
                  aria-label="Chiudi o apri barra laterale"
                  className="text-sidebar-foreground/85 transition-colors duration-150 hover:text-sidebar-foreground"
                />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="pt-1">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="h-9 rounded-lg bg-primary text-[13px] font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/90 hover:text-primary-foreground"
                    onClick={handleNewChat}
                    tooltip="Nuova chat"
                  >
                    <PenSquareIcon className="size-4" />
                    <span>Nuova chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                  <QuickToolsDialog triggerVariant="sidebar" />
                </SidebarMenuItem>

                {user ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="rounded-lg text-sidebar-foreground/85 transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleShowDeleteAllDialog}
                      tooltip="Elimina tutte le chat"
                    >
                      <TrashIcon className="size-4" />
                      <span className="text-[13px]">Elimina cronologia</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarHistory user={user} />
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border pt-2 pb-3">
          {user ? <SidebarUserNav user={user} /> : null}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare tutte le chat?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Tutte le conversazioni
              salvate nel database PostgreSQL verranno rimosse definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Elimina tutto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
