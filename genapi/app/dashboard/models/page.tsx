import { requireAuth } from "@/lib/auth";
import { getInstalledModels, formatModelSize } from "@/lib/ollama";
import { Card, CardContent } from "@/components/ui/card";
import { Boxes, Cpu, Clock, HardDrive } from "lucide-react";

export default async function ModelsPage() {
  await requireAuth();
  const models = await getInstalledModels();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Models</h1>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Manage and view your locally installed AI engine instances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.name} className="shadow-sm border bg-white hover:border-blue-200 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                    <Boxes className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm tracking-tight">{model.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Installed Engine</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <HardDrive className="size-3" />
                    <span className="text-[10px] uppercase font-semibold tracking-wider">Size</span>
                  </div>
                  <p className="text-sm font-medium">{formatModelSize(model.size)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3" />
                    <span className="text-[10px] uppercase font-semibold tracking-wider">Updated</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    {new Date(model.modifiedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {models.length === 0 && (
          <div className="col-span-full py-20 text-center border rounded-xl bg-slate-50/50">
            <Cpu className="size-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium">No models found</p>
            <p className="text-xs text-muted-foreground mt-1">Start your Ollama server to detect models.</p>
          </div>
        )}
      </div>
    </div>
  );
}
