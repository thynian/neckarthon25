import { useState } from "react";
import { Plus, Edit2, Trash2, Users, ArrowLeft, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { useCases } from "@/hooks/useCases";
import { generateCaseId } from "@/utils/idGenerator";
import { toast } from "sonner";
import type { Case, CaseStatus } from "@/types";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { clients, isLoading: clientsLoading, createClient, updateClient } = useClients();
  const { cases, isLoading: casesLoading, createCase, updateCase } = useCases();
  
  // Client states
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<{ id: string; name: string } | null>(null);
  const [newClientName, setNewClientName] = useState("");
  
  // Case states
  const [isCreateCaseDialogOpen, setIsCreateCaseDialogOpen] = useState(false);
  const [isEditCaseDialogOpen, setIsEditCaseDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [newCaseData, setNewCaseData] = useState({ clientId: "", title: "" });

  // Client handlers
  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }

    try {
      await createClient(newClientName.trim());
      setNewClientName("");
      setIsCreateClientDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
    }
  };

  const handleEditClient = async () => {
    if (!editingClient || !editingClient.name.trim()) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }

    try {
      await updateClient({ id: editingClient.id, name: editingClient.name.trim() });
      setEditingClient(null);
      setIsEditClientDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
    }
  };

  const openEditClientDialog = (client: { id: string; name: string; createdAt: string }) => {
    setEditingClient({ id: client.id, name: client.name });
    setIsEditClientDialogOpen(true);
  };

  // Case handlers
  const handleCreateCase = async () => {
    if (!newCaseData.clientId || !newCaseData.title.trim()) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return;
    }

    try {
      const caseId = generateCaseId(cases);
      await createCase({
        client_id: newCaseData.clientId,
        case_id: caseId,
        title: newCaseData.title.trim(),
      });
      setNewCaseData({ clientId: "", title: "" });
      setIsCreateCaseDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
    }
  };

  const handleEditCase = async () => {
    if (!editingCase || !editingCase.title.trim()) {
      toast.error("Bitte geben Sie einen Titel ein");
      return;
    }

    try {
      await updateCase({ 
        id: editingCase.id, 
        updates: { 
          title: editingCase.title.trim(),
          status: editingCase.status,
        } 
      });
      setEditingCase(null);
      setIsEditCaseDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
    }
  };

  const openEditCaseDialog = (caseItem: Case) => {
    setEditingCase(caseItem);
    setIsEditCaseDialogOpen(true);
  };

  const isLoading = clientsLoading || casesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Admin Panel
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Verwalten Sie Mandanten und deren Daten
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gesamt</CardDescription>
              <CardTitle className="text-4xl">{clients.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Mandanten im System</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Neu (30 Tage)</CardDescription>
              <CardTitle className="text-4xl">
                {clients.filter(c => {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return new Date(c.createdAt) > thirtyDaysAgo;
                }).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">In diesem Monat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Neuester</CardDescription>
              <CardTitle className="text-xl truncate">
                {clients.length > 0 ? clients[0].name : "-"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {clients.length > 0
                  ? new Date(clients[0].createdAt).toLocaleDateString("de-DE")
                  : "Keine Daten"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mandanten</CardTitle>
                <CardDescription>
                  Übersicht aller Mandanten im System
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateClientDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Neuer Mandant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Keine Mandanten vorhanden
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Erstellen Sie Ihren ersten Mandanten, um zu beginnen
                </p>
                <Button onClick={() => setIsCreateClientDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ersten Mandanten anlegen
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Erstellt am</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>
                          {new Date(client.createdAt).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditClientDialog(client)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateClientDialogOpen} onOpenChange={setIsCreateClientDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Mandanten anlegen</DialogTitle>
              <DialogDescription>
                Geben Sie die Details für den neuen Mandanten ein.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="z.B. Müller GmbH"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateClient();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateClientDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateClient}>Anlegen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mandant bearbeiten</DialogTitle>
              <DialogDescription>
                Ändern Sie die Details des Mandanten.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="z.B. Müller GmbH"
                  value={editingClient?.name || ""}
                  onChange={(e) =>
                    setEditingClient(
                      editingClient ? { ...editingClient, name: e.target.value } : null
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditClient();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditClientDialogOpen(false);
                  setEditingClient(null);
                }}
              >
                Abbrechen
              </Button>
              <Button onClick={handleEditClient}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
