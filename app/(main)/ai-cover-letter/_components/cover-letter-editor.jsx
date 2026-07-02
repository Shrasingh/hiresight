"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Download,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Edit,
  Monitor,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  updateCoverLetter,
  regenerateCoverLetter,
  deleteCoverLetter,
} from "@/actions/cover-letter";

// Heavy editor loaded on demand (keeps the route bundle lean).
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading editor…
    </div>
  ),
});

const AUTOSAVE_DELAY = 1500;

export default function CoverLetterEditor({ coverLetter }) {
  const router = useRouter();

  const [content, setContent] = useState(coverLetter.content || "");
  const [mode, setMode] = useState("preview"); // "preview" | "edit"
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Track the last persisted content so autosave only fires on real changes.
  const savedContentRef = useRef(coverLetter.content || "");
  const autosaveTimer = useRef(null);

  const persist = useCallback(
    async (value, { silent } = {}) => {
      if (value === savedContentRef.current) return true;
      setIsSaving(true);
      try {
        await updateCoverLetter(coverLetter.id, value);
        savedContentRef.current = value;
        if (!silent) toast.success("Cover letter saved!");
        return true;
      } catch (error) {
        toast.error(error.message || "Failed to save cover letter");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [coverLetter.id]
  );

  // Debounced autosave on edits.
  useEffect(() => {
    if (content === savedContentRef.current) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      persist(content, { silent: true });
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(autosaveTimer.current);
  }, [content, persist]);

  const handleSave = () => persist(content);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const updated = await regenerateCoverLetter(coverLetter.id);
      setContent(updated.content);
      savedContentRef.current = updated.content;
      toast.success("Cover letter regenerated!");
    } catch (error) {
      toast.error(error.message || "Failed to regenerate cover letter");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCoverLetter(coverLetter.id);
      toast.success("Cover letter deleted!");
      router.push("/ai-cover-letter");
    } catch (error) {
      toast.error(error.message || "Failed to delete cover letter");
      setIsDeleting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const fileBase = `${coverLetter.companyName}_${coverLetter.jobTitle}`
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js/dist/html2pdf.min.js"))
        .default;
      const element = document.getElementById("cover-letter-pdf");
      await html2pdf()
        .set({
          margin: 0,
          filename: `${fileBase || "cover-letter"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff", windowWidth: 794 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(element)
        .save();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWord = () => {
    try {
      const inner =
        document.getElementById("cover-letter-pdf")?.innerHTML || "";
      const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Cover Letter</title></head><body style="font-family:Georgia,serif;font-size:12pt;line-height:1.6;">${inner}</body></html>`;
      const blob = new Blob(["﻿", html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileBase || "cover-letter"}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Word document downloaded!");
    } catch (error) {
      console.error("Word export error:", error);
      toast.error("Could not export Word document.");
    }
  };

  const busy = isSaving || isRegenerating || isDeleting || isDownloading;

  return (
    <div data-color-mode="light" className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={coverLetter.status === "completed" ? "default" : "secondary"}>
            {coverLetter.status === "completed" ? "Completed" : "Draft"}
          </Badge>
          {isSaving ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          ) : content === savedContentRef.current ? (
            <span className="inline-flex items-center gap-1 text-green-600">
              <Check className="h-3 w-3" /> Saved
            </span>
          ) : (
            <span>Unsaved changes</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode(mode === "preview" ? "edit" : "preview")}
          >
            {mode === "preview" ? (
              <>
                <Edit className="h-4 w-4 mr-1.5" /> Edit
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4 mr-1.5" /> Preview
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 mr-1.5" />
            ) : (
              <Copy className="h-4 w-4 mr-1.5" />
            )}
            Copy
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={busy}
          >
            {isRegenerating ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            Regenerate
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1.5" />
                )}
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <FileText className="h-4 w-4 mr-2" /> PDF (.pdf)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadWord}>
                <FileText className="h-4 w-4 mr-2" /> Word (.doc)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Save
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this cover letter?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your cover letter for{" "}
                  {coverLetter.jobTitle} at {coverLetter.companyName}. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Editor / preview */}
      <div className="border rounded-lg overflow-hidden">
        <MDEditor
          value={content}
          onChange={(v) => setContent(v || "")}
          height={640}
          preview={mode}
        />
      </div>

      {/* Off-screen, print-styled node for PDF / Word export */}
      <div aria-hidden className="fixed top-0 -left-[10000px] pointer-events-none">
        <div
          id="cover-letter-pdf"
          style={{
            width: 794,
            minHeight: 1123,
            background: "#ffffff",
            color: "#111827",
            boxSizing: "border-box",
            padding: "64px 72px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
