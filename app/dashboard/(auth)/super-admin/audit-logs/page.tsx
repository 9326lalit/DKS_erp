"use client";

import React, { useState } from "react";
import { ShieldCheck, Activity, Search, Filter, Lock, Terminal, Clock, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/textile-erp/page-container";
import { PageHeader } from "@/components/textile-erp/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const INITIAL_AUDIT_LOGS = [
  { id: "LOG-1092", timestamp: "2026-08-01 19:45:12", tenant: "Dhandai Textiles", action: "Tenant Login", user: "bhushan.dks@gmail.com", ip: "103.24.12.8", status: "Success" },
  { id: "LOG-1091", timestamp: "2026-08-01 19:30:04", tenant: "Royal Fabrics", action: "Loom Speed Update", user: "admin@royalfabrics.com", ip: "115.110.84.12", status: "Success" },
  { id: "LOG-1090", timestamp: "2026-08-01 19:15:22", tenant: "SilverThread Denim", action: "Yarn Lot Creation", user: "manager@silverthread.com", ip: "49.36.210.45", status: "Success" },
  { id: "LOG-1089", timestamp: "2026-08-01 18:50:11", tenant: "Mahadev Spinning", action: "Export Invoice Dispatched", user: "admin@mahadevweaving.com", ip: "117.200.42.9", status: "Success" },
  { id: "LOG-1088", timestamp: "2026-08-01 18:10:00", tenant: "SaaS Platform", action: "Super Admin Auth", user: "superadmin@dks-erp.com", ip: "122.169.80.1", status: "Success" },
  { id: "LOG-1087", timestamp: "2026-08-01 17:42:19", tenant: "Dhandai Textiles", action: "GST Return Export", user: "accountant@dhandaitextiles.com", ip: "103.24.12.8", status: "Success" }
];

export default function PlatformAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = INITIAL_AUDIT_LOGS.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.tenant.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.user.toLowerCase().includes(q) ||
      l.ip.toLowerCase().includes(q)
    );
  });

  return (
    <PageContainer>
      <PageHeader
        title="Platform Audit Logs & Security Trails"
        description="Immutable system event trail for compliance, user activity tracking, & security audits."
      />

      <Card className="border border-border">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" /> Platform Security & Activity Event Log
            </CardTitle>
            <CardDescription className="text-xs">
              Monitors tenant user logins, data modifications, GST exports, and Super Admin actions.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, user, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="font-bold">Log ID & Time</TableHead>
                <TableHead className="font-bold">Tenant Organization</TableHead>
                <TableHead className="font-bold">Action Performed</TableHead>
                <TableHead className="font-bold">Authenticated User</TableHead>
                <TableHead className="font-bold">IP Address</TableHead>
                <TableHead className="text-right font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="py-3 text-xs font-mono">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{log.id}</span>
                      <span className="text-muted-foreground text-[10px]">{log.timestamp}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-xs font-semibold text-foreground">
                    {log.tenant}
                  </TableCell>

                  <TableCell className="py-3 text-xs">
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 font-semibold">
                      {log.action}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                    {log.user}
                  </TableCell>

                  <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                    {log.ip}
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <Badge className="bg-emerald-500/20 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
