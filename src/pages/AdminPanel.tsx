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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const { clients, isLoading: clientsLoading, createClient, updateClient, deleteClient } = useClients();
  const { cases, isLoading: casesLoading, createCase, updateCase } = useCases();
  
  // Client states
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<{ id: string; name: string } | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  
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

  const handleDeleteClient = async () => {
    if (!deleteClientId) return;
    
    try {
      await deleteClient(deleteClientId);
      setDeleteClientId(null);
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  // Case handlers
  const handleCreateCase = async () => {
    if (!newCaseData.clientId || !newCaseData.title.trim()) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return;
    }

    try {
      const caseId = generateCaseId(cases);
      console.log("Creating case with:", { caseId, clientId: newCaseData.clientId, title: newCaseData.title });
      await createCase({
        client_id: newCaseData.clientId,
        case_id: caseId,
        title: newCaseData.title.trim(),
      });
      setNewCaseData({ clientId: "", title: "" });
      setIsCreateCaseDialogOpen(false);
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      toast.error("Fehler beim Erstellen des Falls");
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
            Verwalten Sie Mandanten und Fälle
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Mandanten</CardDescription>
              <CardTitle className="text-4xl">{clients.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Im System</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Fälle</CardDescription>
              <CardTitle className="text-4xl">{cases.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Offene Fälle</CardDescription>
              <CardTitle className="text-4xl">
                {cases.filter(c => c.status === "OPEN").length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">In Bearbeitung</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Geschlossene Fälle</CardDescription>
              <CardTitle className="text-4xl">
                {cases.filter(c => c.status === "CLOSED").length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Clients and Cases */}
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="clients">Mandanten</TabsTrigger>
            <TabsTrigger value="cases">Fälle</TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mandanten</CardTitle>
                    <CardDescription>
                      Alle registrierten Mandanten im Überblick
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCreateClientDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Neuer Mandant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditClientDialog(client)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteClientId(client.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fälle</CardTitle>
                    <CardDescription>
                      Alle Fälle im Überblick
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCreateCaseDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Neuer Fall
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fall-ID</TableHead>
                      <TableHead>Titel</TableHead>
                      <TableHead>Mandant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erstellt am</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.map((caseItem) => {
                      const client = clients.find(c => c.id === caseItem.clientId);
                      return (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-mono text-sm">{caseItem.caseId}</TableCell>
                          <TableCell className="font-medium">{caseItem.title}</TableCell>
                          <TableCell>{client?.name || "Unbekannt"}</TableCell>
                          <TableCell>
                            <Badge variant={caseItem.status === "OPEN" ? "default" : "secondary"}>
                              {caseItem.status === "OPEN" ? "Offen" : "Geschlossen"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(caseItem.createdAt).toLocaleDateString("de-DE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditCaseDialog(caseItem)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Client Dialog */}
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

      {/* Edit Client Dialog */}
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

      {/* Create Case Dialog */}
      <Dialog open={isCreateCaseDialogOpen} onOpenChange={setIsCreateCaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Fall erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Fall für einen Mandanten
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="case-client">Mandant</Label>
              <Select
                value={newCaseData.clientId}
                onValueChange={(value) =>
                  setNewCaseData({ ...newCaseData, clientId: value })
                }
              >
                <SelectTrigger id="case-client">
                  <SelectValue placeholder="Mandant auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="case-title">Titel</Label>
              <Input
                id="case-title"
                placeholder="Titel des Falls"
                value={newCaseData.title}
                onChange={(e) =>
                  setNewCaseData({ ...newCaseData, title: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCase();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateCaseDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={handleCreateCase}>Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Case Dialog */}
      <Dialog open={isEditCaseDialogOpen} onOpenChange={setIsEditCaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fall bearbeiten</DialogTitle>
            <DialogDescription>
              Ändern Sie den Titel oder Status des Falls
            </DialogDescription>
          </DialogHeader>
          {editingCase && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-case-id">Fall-ID</Label>
                <Input
                  id="edit-case-id"
                  value={editingCase.caseId}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-case-title">Titel</Label>
                <Input
                  id="edit-case-title"
                  value={editingCase.title}
                  onChange={(e) =>
                    setEditingCase({ ...editingCase, title: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEditCase();
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-case-status">Status</Label>
                <Select
                  value={editingCase.status}
                  onValueChange={(value: CaseStatus) =>
                    setEditingCase({ ...editingCase, status: value })
                  }
                >
                  <SelectTrigger id="edit-case-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Offen</SelectItem>
                    <SelectItem value="CLOSED">Geschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCaseDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={handleEditCase}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Alert Dialog */}
      <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mandant löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Mandant wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
