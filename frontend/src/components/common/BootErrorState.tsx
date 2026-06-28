import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BootErrorStateProps {
  title: string;
  message: string;
  details: string;
}

export function BootErrorState({
  title,
  message,
  details,
}: BootErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
            <code>{details}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
