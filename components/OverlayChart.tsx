"use client";
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Product = { id:number; name:string };
type Point = { day:number; [key:string]: number };

const COLORS = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

export default function OverlayChart({ products }:{ products: Product[] }) {
  const [metric, setMetric] = useState<"inventory"|"procurementAmount"|"salesAmount">("inventory");
  const [seriesMap, setSeriesMap] = useState<Record<number, {day:number; inventory:number; procurementAmount:number; salesAmount:number}[]>>({});

  useEffect(() => {
    (async ()=>{
      const data: Record<number, any[]> = {};
      for (const p of products) {
        const r = await fetch(`/api/series/${p.id}`);
        data[p.id] = r.ok ? await r.json() : [];
      }
      setSeriesMap(data);
    })();
  }, [products.map(p=>p.id).join(","), metric]);

  const merged: Point[] = useMemo(() => {
    const maxDay = Math.max(0, ...Object.values(seriesMap).map(arr => (arr?.length ? arr[arr.length-1].day : 0)));
    const rows: Point[] = [];
    for (let d=1; d<=maxDay; d++){
      const row: Point = { day: d };
      for (const pid of Object.keys(seriesMap)) {
        const found = seriesMap[Number(pid)]?.find(it => it.day===d);
        if (found) row[pid] = found[metric];
      }
      rows.push(row);
    }
    return rows;
  }, [seriesMap, metric]);

  return (
    <div className="border rounded-2xl p-4">
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
        <h3 className="font-medium" style={{ margin:0 }}>Overlay compare</h3>
        <label style={{ fontSize:14 }}>
          Metric:&nbsp;
          <select value={metric} onChange={e=>setMetric(e.target.value as any)}>
            <option value="inventory">Inventory</option>
            <option value="procurementAmount">Procurement Amount</option>
            <option value="salesAmount">Sales Amount</option>
          </select>
        </label>
      </div>

      <div style={{ width:"100%", height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tickFormatter={(v)=>`Day ${v}`} />
            <YAxis tickFormatter={(v)=> metric === "inventory" ? Number(v).toFixed(0) : `$${Number(v).toFixed(0)}`} />
            <Tooltip
            labelFormatter={(d)=>`Day ${d}`}
            formatter={(val, name) =>
                metric === "inventory"
                ? [Number(val).toFixed(2), name]
                : [`$${Number(val).toFixed(2)}`, name]
            }/>
            {products.map((p, idx) => (
                <Line
                key={p.id}
                type="monotone"
                dataKey={String(p.id)}
                name={`${p.id} · ${p.name}`}
                dot={false}
                stroke={COLORS[idx % COLORS.length]}
                />
            ))}
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
