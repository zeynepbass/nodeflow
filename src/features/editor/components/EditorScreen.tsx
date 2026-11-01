"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { buttonClass } from "@/shared/ui/atoms/Button";
import { EmptyState } from "@/shared/ui/molecules/EmptyState";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useEditor } from "@/features/editor/store/editor";
import { useWorkflow } from "@/features/workflows/hooks/useWorkflows";
import { ApiError } from "@/shared/api/http-client";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { QueryError } from "@/shared/ui/molecules/QueryError";
import { useAutosave } from "@/features/editor/hooks/useAutosave";

function EditorSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-fg-muted">
      <Spinner size={24} />
    </div>
  );
}

const DesktopEditor = dynamic(() => import("./DesktopEditor"), {
  ssr: false,
  loading: EditorSpinner,
});

const MobileEditor = dynamic(() => import("./MobileEditor"), {
  ssr: false,
  loading: EditorSpinner,
});

function EditorBody() {
  const save = useAutosave();
  const isMobile = useMediaQuery("(max-width: 767px)");
  if (isMobile) return <MobileEditor onRetrySave={save} />;
  return <DesktopEditor save={save} />;
}

function EditorContent({ id }: { id: string }) {
  const { data: workflow, isPending, error, refetch } = useWorkflow(id);
  const loadedId = useEditor((state) => state.workflowId);
  const load = useEditor((state) => state.load);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (workflow && !loadedOnce.current) {
      loadedOnce.current = true;
      load(workflow);
    }
  }, [load, workflow]);

  if (error instanceof ApiError && error.status === 404) {
    return (
      <EmptyState
        icon={SearchX}
        title="Workflow bulunamadı"
        description="Bu workflow silinmiş veya hiç oluşturulmamış olabilir."
        action={
          <Link href="/is-akislari" className={buttonClass()}>
            Workflow&apos;lara Dön
          </Link>
        }
      />
    );
  }
  if (error) return <QueryError onRetry={() => refetch()} />;
  if (isPending || loadedId !== id) return <EditorSpinner />;

  return <EditorBody />;
}

export function EditorScreen({ id }: { id: string }) {
  return <EditorContent key={id} id={id} />;
}
