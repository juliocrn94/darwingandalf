import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, MessageSquare, Settings } from "lucide-react";

export const ViewFlowStep = () => {
  // Mock flow data - in real app would come from selected agent
  const mockFlow = {
    mission: "Help guests find and book the perfect accommodation",
    context: "Understands room types, amenities, pricing, and availability",
    intents: [
      { name: "book_room", description: "Book a hotel room" },
      { name: "check_availability", description: "Check room availability" },
      { name: "view_amenities", description: "View hotel amenities" },
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          View Agent Flow
        </h2>
        <p className="text-muted-foreground">
          Revisa y edita el flujo conversacional del agente
        </p>
      </div>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flow">
            <GitBranch className="w-4 h-4 mr-2" />
            Flujo
          </TabsTrigger>
          <TabsTrigger value="intents">
            <MessageSquare className="w-4 h-4 mr-2" />
            Intents
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flow" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Misión del Agente</h3>
            <p className="text-muted-foreground mb-6">{mockFlow.mission}</p>
            
            <h3 className="font-semibold text-lg mb-4">Contexto</h3>
            <p className="text-muted-foreground">{mockFlow.context}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-2" />
                <p>Diagrama de flujo conversacional</p>
                <p className="text-sm">(Próximamente: editor visual)</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="intents" className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">
              Intenciones del Usuario ({mockFlow.intents.length})
            </h3>
            <div className="space-y-3">
              {mockFlow.intents.map((intent, index) => (
                <div 
                  key={index}
                  className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{intent.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {intent.description}
                      </p>
                    </div>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Configuración del Agente</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Idioma
                </label>
                <p className="text-muted-foreground">Español</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Timeout de sesión
                </label>
                <p className="text-muted-foreground">5 minutos</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Nivel de confianza mínimo
                </label>
                <p className="text-muted-foreground">70%</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
