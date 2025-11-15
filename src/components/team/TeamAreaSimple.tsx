import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { useDocumentations } from "@/hooks/useDocumentations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TeamArea = () => {
  const { clients, isLoading: clientsLoading } = useClients();
  const { cases, isLoading: casesLoading } = useCases();
  const { documentations, isLoading: docsLoading } = useDocumentations();

  const isLoading = clientsLoading || casesLoading || docsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Bereich</h1>
        <p className="text-muted-foreground mt-2">
          Übersicht über alle Mandanten, Fälle und Dokumentationen
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Mandanten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clients.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Gesamt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fälle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{cases.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {cases.filter(c => c.status === 'OPEN').length} offen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dokumentationen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documentations.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {documentations.filter(d => d.status === 'OPEN').length} offen
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mandanten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {clients.map(client => (
              <div key={client.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {cases.filter(c => c.clientId === client.id).length} Fälle
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
