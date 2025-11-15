import { Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardActions = () => {
  const handleStartRecording = () => {
    console.log("Neue Audioaufnahme starten - noch nicht implementiert");
  };

  const handleNewDocumentation = () => {
    console.log("Neue Dokumentation anlegen - noch nicht implementiert");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktionen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            size="lg"
            onClick={handleStartRecording}
            className="h-24 text-lg"
          >
            <Mic className="mr-3 h-6 w-6" />
            Neue Audioaufnahme starten
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleNewDocumentation}
            className="h-24 text-lg"
          >
            <FileText className="mr-3 h-6 w-6" />
            Neue Dokumentation anlegen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
