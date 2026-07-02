"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  LayoutTemplate,
  FileText,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

import {
  RESUME_TEMPLATES,
  DEFAULT_TEMPLATE_ID,
  getTemplateById,
} from "./templates";
import TemplateSelector from "./templates/TemplateSelector";
import { ResponsiveResume } from "./templates/ScaledResume";
import { buildResumeData, isResumeEmpty } from "./templates/resume-data";

// Heavy, editor-only dependency — load on demand to keep the bundle lean.
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-[800px] flex items-center justify-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading editor…
    </div>
  ),
});

const TEMPLATE_STORAGE_KEY = "hiresight:resume-template";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Watch form fields for preview updates
  const formValues = watch();

  // Normalized data shared by every template (single source of truth).
  const resumeData = useMemo(
    () => buildResumeData(formValues, user?.fullName),
    [formValues, user?.fullName]
  );
  const emptyResume = isResumeEmpty(resumeData);

  const selectedTemplate = getTemplateById(templateId);
  const SelectedComponent = selectedTemplate.Component;

  // Restore the user's last-used template from localStorage.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (saved && RESUME_TEMPLATES.some((t) => t.id === saved)) {
        setTemplateId(saved);
      }
    } catch {
      /* localStorage unavailable — fall back to default */
    }
  }, []);

  const handleSelectTemplate = (id) => {
    setTemplateId(id);
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, id);
    } catch {
      /* ignore persistence errors */
    }
  };

  useEffect(() => {
    if (initialContent) setActiveTab("markdown");
  }, [initialContent]);

  // Update markdown preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues, activeTab]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.github) parts.push(`💻 [GitHub](${contactInfo.github})`);
    if (contactInfo.portfolio)
      parts.push(`🌐 [Portfolio](${contactInfo.portfolio})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  // Export the selected premium template to a pixel-matched A4 PDF.
  const generatePDF = async () => {
    if (emptyResume) {
      toast.error("Add some details in the Form tab first.");
      return;
    }
    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js/dist/html2pdf.min.js"))
        .default;
      const element = document.getElementById("resume-export-root");
      const safeName = (user?.fullName || "resume")
        .trim()
        .replace(/\s+/g, "_");
      const opt = {
        margin: 0,
        filename: `${safeName}_${selectedTemplate.id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: 794,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
        // Keep <a> tags clickable in the exported PDF (link annotations
        // overlaid on the rasterized page at each anchor's position).
        enableLinks: true,
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Could not generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async () => {
    try {
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="font-bold gradient-title text-4xl md:text-5xl">
            Resume Builder
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Fill in your details, pick a premium template, and export a
            recruiter-ready PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit" className="gap-1.5">
            <FileText className="h-4 w-4" /> Form
          </TabsTrigger>
          <TabsTrigger value="template" className="gap-1.5">
            <LayoutTemplate className="h-4 w-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="markdown" className="gap-1.5">
            <Code2 className="h-4 w-4" /> Markdown
          </TabsTrigger>
        </TabsList>

        {/* ---------------- FORM TAB (unchanged data logic) ---------------- */}
        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GitHub URL</label>
                  <Input
                    {...register("contactInfo.github")}
                    type="url"
                    placeholder="https://github.com/your-username"
                  />
                  {errors.contactInfo?.github && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.github.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Portfolio / LeetCode URL
                  </label>
                  <Input
                    {...register("contactInfo.portfolio")}
                    type="url"
                    placeholder="https://leetcode.com/u/your-handle"
                  />
                  {errors.contactInfo?.portfolio && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.portfolio.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: you can also paste links (GitHub, LeetCode, live demos)
                directly inside any Project or Experience description as{" "}
                <code>[label](https://…)</code> — they become clickable in the
                resume and PDF.
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                    error={errors.summary}
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        {/* ---------------- TEMPLATES TAB (new) ---------------- */}
        <TabsContent value="template" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Choose a template</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Switch anytime — your details stay exactly the same.
            </p>
            <TemplateSelector
              data={resumeData}
              selectedId={templateId}
              onSelect={handleSelectTemplate}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Live preview</h3>
              <span className="text-xs text-muted-foreground">
                {selectedTemplate.name} · A4
              </span>
            </div>

            {emptyResume ? (
              <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
                <LayoutTemplate className="h-8 w-8 mx-auto mb-3 opacity-60" />
                <p className="font-medium text-foreground">Nothing to preview yet</p>
                <p className="text-sm">
                  Head to the <span className="font-medium">Form</span> tab and
                  add your details to see them render live here.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/40 p-4 md:p-8 overflow-auto">
                <div className="shadow-premium bg-white mx-auto w-fit rounded-sm overflow-hidden">
                  <ResponsiveResume maxScale={1}>
                    <SelectedComponent data={resumeData} />
                  </ResponsiveResume>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ---------------- MARKDOWN TAB (unchanged behaviour) ---------------- */}
        <TabsContent value="markdown">
          <Button
            variant="link"
            type="button"
            className="mb-2"
            onClick={() =>
              setResumeMode(resumeMode === "preview" ? "edit" : "preview")
            }
          >
            {resumeMode === "preview" ? (
              <>
                <Edit className="h-4 w-4" />
                Edit Resume
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>

          {resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Off-screen, full-size render used for pixel-perfect PDF export. */}
      <div
        aria-hidden
        className="fixed top-0 -left-[10000px] pointer-events-none"
      >
        <div id="resume-export-root">
          <SelectedComponent data={resumeData} />
        </div>
      </div>
    </div>
  );
}
