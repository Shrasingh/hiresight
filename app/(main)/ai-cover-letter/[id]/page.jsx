import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterEditor from "../_components/cover-letter-editor";

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  if (!coverLetter) notFound();

  return (
    <div className="container mx-auto py-6 space-y-2">
      <Link href="/ai-cover-letter">
        <Button variant="link" className="gap-2 pl-0">
          <ArrowLeft className="h-4 w-4" />
          Back to Cover Letters
        </Button>
      </Link>

      <div className="pb-4">
        <h1 className="text-4xl md:text-5xl font-bold gradient-title">
          {coverLetter.jobTitle} at {coverLetter.companyName}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Created {format(new Date(coverLetter.createdAt), "PPP")}
        </p>
      </div>

      <CoverLetterEditor coverLetter={coverLetter} />
    </div>
  );
}
