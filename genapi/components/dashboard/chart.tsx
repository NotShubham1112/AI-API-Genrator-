"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface ChartProps {
  data: Array<{ [key: string]: string | number }>;
  title: string;
  type: "line" | "bar" | "area" | "radial";
  subtitle?: string;
  footer?: string;
  dataKey: string;
  // dataKey retained for compatibility; for radial, dataKey should refer to the numeric field in data
}

export default function Chart({ data, title, type, dataKey, subtitle, footer }: ChartProps) {
  return (
    <Card className="border-slate-700 bg-slate-800">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {subtitle ? <CardDescription className="text-sm text-muted-foreground">{subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === "line" && (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                cursor={{ stroke: "#0ea5e9" }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
          {type === "bar" && (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey={dataKey} fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
          {type === "area" && (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey={dataKey} stroke="#3B82F6" fill="#1e3a8a33" />
            </AreaChart>
          )}
          {type === "radial" && (
            <RadialBarChart
              width={420}
              height={300}
              innerRadius="10%"
              outerRadius="80%"
              data={data}
            >
              <RadialBar dataKey={dataKey} fill="#3B82F6" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
              />
            </RadialBarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
      {footer ? (
        <CardFooter>
          <span className="text-xs text-muted-foreground">{footer}</span>
        </CardFooter>
      ) : null}
    </Card>
  );
}
