"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

type SeriesPoint = { day:number; inventory:number; procurementAmount:number; salesAmount:number };

export default function Chart({ product }:{ product:{ id:number; name:string } }){
  const [data, setData] = useState<SeriesPoint[]>([]);
  useEffect(()=>{ (async()=>{ const r=await fetch(`/api/series/${product.id}`); if(r.ok) setData(await r.json()); })(); },[product.id]);

  return (
    <div className="border rounded-2xl p-4">
      <h3 className="font-medium mb-3">{product.id} · {product.name}</h3>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tickFormatter={(v)=>`Day ${v}`} />
            <YAxis
            yAxisId="inv"
            tickFormatter={(v) => Number(v).toFixed(0)}
            label={{ value: "Inventory (units)", angle: -90, position: "insideLeft" }}
            />
            <YAxis
            yAxisId="amt"
            orientation="right"
            tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            allowDecimals={false}
            label={{ value: "Amount ($)", angle: -90, position: "insideRight" }}
            />
            <Tooltip
            labelFormatter={(day) => `Day ${day}`}
            formatter={(value, name) =>
              (name === "Procurement Amount" || name === "Sales Amount")
              ? [`$${Number(value).toFixed(4)}`, name]  
              : [Number(value).toFixed(2), name]       
  }
/>
            <Legend />
            <Line yAxisId="inv" type="monotone" dataKey="inventory" name="Inventory" dot={false} stroke="#2ca02c" />
            <Line yAxisId="amt" type="monotone" dataKey="procurementAmount" name="Procurement Amount" dot={false} stroke="#ff7f0e" />
            <Line yAxisId="amt" type="monotone" dataKey="salesAmount" name="Sales Amount" dot={false} stroke="#d62728" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}