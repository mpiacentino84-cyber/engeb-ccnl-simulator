import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { trpc } from "@/lib/trpc";
import { Shield, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Users() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Fetch all users
  const { data: users, isLoading, refetch } = trpc.user.getAll.useQuery();

  // Update role mutation
  const updateRoleMutation = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Ruolo utente aggiornato con successo!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteUserMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast.success("Utente eliminato con successo!");
      refetch();
      setDeleteUserId(null);
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Accesso Negato</CardTitle>
            <CardDescription>
              Solo gli amministratori possono accedere a questa pagina.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRoleChange = (userId: number, newRole: "user" | "consultant" | "admin") => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleDeleteClick = (userId: number) => {
    setDeleteUserId(userId);
  };

  const handleDeleteConfirm = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate({ id: deleteUserId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Gestione Utenti
          </h1>
          <p className="text-lg text-blue-700">
            Gestisci i ruoli e i permessi degli utenti
          </p>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Utenti Registrati
                </CardTitle>
                <CardDescription>
                  Visualizza e gestisci tutti gli utenti del sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : users && users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Metodo Login</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>Data Registrazione</TableHead>
                      <TableHead>Ultimo Accesso</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.id}</TableCell>
                        <TableCell>{u.name || "-"}</TableCell>
                        <TableCell>{u.email || "-"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {u.loginMethod || "manus"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(value) =>
                              handleRoleChange(u.id, value as "user" | "consultant" | "admin")
                            }
                            disabled={u.id === user.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Utente</SelectItem>
                              <SelectItem value="consultant">Consulente</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString("it-IT")}
                        </TableCell>
                        <TableCell>
                          {new Date(u.lastSignedIn).toLocaleDateString("it-IT")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(u.id)}
                            disabled={u.id === user.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Nessun utente registrato</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 shadow-lg bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              ℹ️ Informazioni sulla Gestione Utenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                • <strong>Admin</strong>: Accesso completo a dashboard,
                gestione CCNL e utenti
              </li>
              <li>
                • <strong>User</strong>: Accesso solo al simulatore pubblico
              </li>
              <li>
                • Non puoi modificare il tuo stesso ruolo o eliminare il tuo
                account
              </li>
              <li>
                • Le modifiche ai ruoli sono immediate e richiedono un nuovo
                login
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteUserId !== null}
        onOpenChange={() => setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo utente? Questa azione non
              può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
