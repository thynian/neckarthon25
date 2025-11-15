import { Documentation, Case } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface OpenDocumentationsProps {
  documentations: Documentation[];
  cases: Case[];
  onOpenDocumentation: (docId: string) => void;
}

export const OpenDocumentations = ({
  documentations,
  cases,
  onOpenDocumentation,
}: OpenDocumentationsProps) => {
  const openDocs = documentations.filter((doc) => doc.status === "OPEN");

  const getCaseById = (caseId: string) => {
    return cases.find((c) => c.id === caseId);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Meine offenen Dokumentationen</CardTitle>
      </CardHeader>
      <CardContent>
        {openDocs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Keine offenen Dokumentationen vorhanden
          </p>
        ) : (
          <div className="space-y-2">
            {openDocs.map((doc) => {
              const linkedCase = getCaseById(doc.caseId);
              return (
                <div
                  key={doc.id}
                  className="border border-border rounded-lg p-2 sm:p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm sm:text-base truncate">
                      {doc.title}
                    </span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(doc.date).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {linkedCase && ` · Fall: ${linkedCase.caseId}`}
                  </div>
                  <div className="flex justify-end mt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOpenDocumentation(doc.id)}
                      className="text-xs sm:text-sm px-2 py-1"
                    >
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Öffnen
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
