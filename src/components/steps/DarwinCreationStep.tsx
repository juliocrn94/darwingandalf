import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, CheckCircle2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface DarwinCreationStepProps {
  agentId: string;
  agentName: string;
  discoveryData: any;
}

export const DarwinCreationStep = ({
  agentId,
  agentName: initialAgentName,
  discoveryData,
}: DarwinCreationStepProps) => {
  const { toast } = useToast();
  const [agentName, setAgentName] = useState(initialAgentName);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [darwinAgentId, setDarwinAgentId] = useState<string>("");

  const handleCreateInDarwin = async () => {
    setIsCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-in-darwin", {
        body: {
          agentId,
          agentName,
          discoveryData,
        },
      });

      if (error) throw error;

      setDarwinAgentId(data.darwinId);
      setIsCreated(true);

      toast({
        title: "¡Agente creado exitosamente!",
        description: `${agentName} ha sido creado en Darwin`,
      });
    } catch (error) {
      console.error("Error creating agent in Darwin:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el agente en Darwin",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportConfig = async () => {
    try {
      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .single();

      const config = {
        agent,
        discoveryData,
        darwinId: darwinAgentId,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${agentName.toLowerCase().replace(/\s+/g, "-")}-config.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Configuración exportada",
        description: "El archivo JSON ha sido descargado",
      });
    } catch (error) {
      console.error("Error exporting config:", error);
      toast({
        title: "Error",
        description: "No se pudo exportar la configuración",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Crear Agente en Darwin</h2>
        <p className="text-muted-foreground">
          Último paso: confirma el nombre y crea tu agente en Darwin
        </p>
      </div>

      {!isCreated ? (
        <>
          {/* Configuration Summary */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle>Resumen de Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Sitio Web</Label>
                  <p className="font-medium">{discoveryData.companyWebsite || "No especificado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Propósito</Label>
                  <p className="font-medium">{discoveryData.agentPurpose || "No especificado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Integraciones</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {discoveryData.integrations?.map((int: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {int}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">Ninguna</span>}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Template Base</Label>
                  <p className="font-medium">Personalizado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Name Input */}
          <Card className="p-6 bg-card border-border">
            <Label htmlFor="agentName" className="text-foreground mb-2">
              Nombre del Agente en Darwin
            </Label>
            <Input
              id="agentName"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Ej: AsistenteVentas, SoporteTécnico, etc."
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Este será el nombre con el que se creará el agente en Darwin
            </p>
          </Card>

          {/* Create Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleCreateInDarwin}
              disabled={isCreating || !agentName.trim()}
              size="lg"
              className="gap-2 px-8"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando {agentName}...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Crear {agentName} en Darwin
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Success State */}
          <Card className="p-8 bg-gradient-primary border-0 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  ¡{agentName} fue creado exitosamente!
                </h3>
                <p className="text-white/80">
                  Tu agente conversacional está listo para ser desplegado en Darwin
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                ID en Darwin: {darwinAgentId}
              </Badge>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleExportConfig} variant="outline" size="lg" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Configuración JSON
            </Button>
            <Button
              onClick={() => window.location.reload()}
              size="lg"
              variant="default"
              className="gap-2"
            >
              Crear Otro Agente
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
