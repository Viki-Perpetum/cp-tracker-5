import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Clock, Search, Eye, Building2, FileText, Landmark } from "lucide-react";

type Status = "on-track" | "at-risk" | "blocked" | "completed";

interface CP {
  id: string;
  name: string;
  contractor: string;
  drawdownDate: string;
  milestonePct: number;
  belfiusCondition: string;
  belfiusStatus: Status;
  missingDocs: string[];
  status: Status;
  owner: string;
  value: string;
}

const CPS: CP[] = [
  { id: "CP-01", name: "Foundation & Earthworks", contractor: "ArconBuild NV", drawdownDate: "2024-08-15", milestonePct: 100, belfiusCondition: "Notarial deed received", belfiusStatus: "completed", missingDocs: [], status: "completed", owner: "Sophie Leclercq", value: "€ 1,240,000" },
  { id: "CP-02", name: "Structural Frame", contractor: "SteelCore BVBA", drawdownDate: "2024-10-31", milestonePct: 78, belfiusCondition: "Architect progress cert. Q3", belfiusStatus: "at-risk", missingDocs: ["Architect cert. Q3", "Insurance endorsement"], status: "at-risk", owner: "Tom Devos", value: "€ 2,850,000" },
  { id: "CP-03", name: "Façade & Roofing", contractor: "FacadePro SA", drawdownDate: "2025-01-20", milestonePct: 42, belfiusCondition: "Waterproofing warranty", belfiusStatus: "blocked", missingDocs: ["Waterproofing warranty doc", "EPB declaration", "Fire safety report"], status: "blocked", owner: "Marie Janssen", value: "€ 1,780,000" },
  { id: "CP-04", name: "MEP Installations", contractor: "TechniFlux NV", drawdownDate: "2025-03-10", milestonePct: 18, belfiusCondition: "Technical inspection report", belfiusStatus: "on-track", missingDocs: ["HVAC schematics v2"], status: "on-track", owner: "Lucas Peeters", value: "€ 3,400,000" },
  { id: "CP-05", name: "Interior Fit-out", contractor: "InnoSpace BV", drawdownDate: "2025-06-30", milestonePct: 5, belfiusCondition: "Signed contractor schedule", belfiusStatus: "on-track", missingDocs: [], status: "on-track", owner: "Sophie Leclercq", value: "€ 980,000" },
  { id: "CP-06", name: "Landscaping & External Works", contractor: "GreenLine SA", drawdownDate: "2025-08-01", milestonePct: 0, belfiusCondition: "Environmental permit", belfiusStatus: "at-risk", missingDocs: ["Environmental permit copy", "Drainage study"], status: "at-risk", owner: "Tom Devos", value: "€ 560,000" }
];

const statusConfig: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: "Completed", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  "on-track": { label: "On Track", color: "bg-blue-500/15 text-blue-600 border-blue-500/30", icon: <Clock className="w-3.5 h-3.5" /> },
  "at-risk": { label: "At Risk", color: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  blocked: { label: "Blocked", color: "bg-red-500/15 text-red-600 border-red-500/30", icon: <AlertTriangle className="w-3.5 h-3.5" /> }
};

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 30 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function CpTracker() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState<CP | null>(null);

  const filtered = useMemo(() => {
    return CPS.filter(cp => {
      const matchTab = tab === "all" || cp.status === tab;
      const q = search.toLowerCase();
      const matchSearch = !q || cp.id.toLowerCase().includes(q) || cp.name.toLowerCase().includes(q) || cp.contractor.toLowerCase().includes(q) || cp.owner.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [search, tab]);

  const kpis = useMemo(() => ({
    total: CPS.length,
    blocked: CPS.filter(c => c.status === "blocked").length,
    atRisk: CPS.filter(c => c.status === "at-risk").length,
    missingDocs: CPS.reduce((s, c) => s + c.missingDocs.length, 0)
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CP Milestone & Drawdown Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">Unified view of Construction Packages, Belfius conditions, and contractor deliverables — steerco-ready at all times.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Total CPs</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-foreground">{kpis.total}</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500" />Blocked</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-red-500">{kpis.blocked}</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />At Risk</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-amber-500">{kpis.atRisk}</p></CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary" />Missing Docs</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4"><p className="text-3xl font-bold text-primary">{kpis.missingDocs}</p></CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="px-6 pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <CardTitle className="text-base font-semibold">Construction Packages</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search CP, contractor, owner…" className="pl-8 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs">All ({CPS.length})</TabsTrigger>
              <TabsTrigger value="blocked" className="text-xs">Blocked ({kpis.blocked})</TabsTrigger>
              <TabsTrigger value="at-risk" className="text-xs">At Risk ({kpis.atRisk})</TabsTrigger>
              <TabsTrigger value="on-track" className="text-xs">On Track</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-0">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-semibold">CP</TableHead>
                      <TableHead className="text-xs font-semibold">Contractor</TableHead>
                      <TableHead className="text-xs font-semibold hidden md:table-cell">Progress</TableHead>
                      <TableHead className="text-xs font-semibold hidden lg:table-cell"><span className="flex items-center gap-1"><Landmark className="w-3 h-3" />Belfius Condition</span></TableHead>
                      <TableHead className="text-xs font-semibold hidden sm:table-cell">Drawdown Date</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold hidden lg:table-cell">Owner</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-10">No packages match your filters.</TableCell></TableRow>
                    )}
                    {filtered.map(cp => (
                      <TableRow key={cp.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-mono text-xs font-semibold text-primary">{cp.id}</div>
                          <div className="text-xs text-foreground font-medium leading-tight mt-0.5">{cp.name}</div>
                        </TableCell>
                        <TableCell className="text-xs text-foreground">{cp.contractor}</TableCell>
                        <TableCell className="hidden md:table-cell w-32"><ProgressBar pct={cp.milestonePct} /></TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[180px] truncate">{cp.belfiusCondition}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{cp.drawdownDate}</TableCell>
                        <TableCell><StatusBadge status={cp.status} /></TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{cp.owner}</TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelected(cp)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="font-mono text-sm text-primary">{selected.id}</span>
                <span className="text-base">{selected.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Contractor</p><p className="font-medium text-foreground">{selected.contractor}</p></div>
                <div><p className="text-xs text-muted-foreground">Contract Value</p><p className="font-medium text-foreground">{selected.value}</p></div>
                <div><p className="text-xs text-muted-foreground">Drawdown Date</p><p className="font-medium text-foreground">{selected.drawdownDate}</p></div>
                <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium text-foreground">{selected.owner}</p></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Milestone Progress</p>
                <ProgressBar pct={selected.milestonePct} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Overall Status</p>
                <StatusBadge status={selected.status} />
              </div>
              <div className="rounded-md border border-border p-3 bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Landmark className="w-3 h-3" />Belfius Financing Condition</p>
                  <StatusBadge status={selected.belfiusStatus} />
                </div>
                <p className="text-sm text-foreground">{selected.belfiusCondition}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><FileText className="w-3 h-3" />Missing Documents ({selected.missingDocs.length})</p>
                {selected.missingDocs.length === 0 ? (
                  <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />All documents received</p>
                ) : (
                  <ul className="space-y-1">
                    {selected.missingDocs.map(d => (
                      <li key={d} className="flex items-center gap-2 text-xs text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Close</Button>
              <Button size="sm">Request Missing Docs</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
