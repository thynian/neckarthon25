import { Documentation, Case } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface OpenDocumentationsProps {
  documentations: Documentation[];
  cases: Case[];
}

export const OpenDocumentations = ({
  documentations,
  cases,
}: OpenDocumentationsProps) => {
  const openDocs = documentations.filter((doc) => doc.status === "OPEN");

  const getCaseById = (caseId: string) => {
    return cases.find((c) => c.id === caseId);
  };

  const handleOpenDocumentation = (docId: string) => {
    console.log("Öffne Dokumentation:", docId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meine offenen Dokumentationen</CardTitle>
      </CardHeader>
      <CardContent>
        {openDocs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Keine offenen Dokumentationen vorhanden
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Titel
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Fall-ID
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Datum
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {openDocs.map((doc) => {
                  const linkedCase = getCaseById(doc.caseId);
                  return (
                    <tr key={doc.id} className="border-b border-border/50">
                      <td className="py-4 text-sm font-medium text-foreground">
                        {doc.title}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {linkedCase?.caseId || "—"}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(doc.date).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary">{doc.status}</Badge>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDocumentation(doc.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Öffnen
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
