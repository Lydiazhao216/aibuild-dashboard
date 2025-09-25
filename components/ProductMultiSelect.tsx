"use client";
import { useMemo } from "react";

type Product = { id: number; name: string };
export default function ProductMultiSelect({ products, selected, onChange }:{ products: Product[]; selected: number[]; onChange:(v:number[])=>void }){
  const options = useMemo(()=>products.map(p=>({label:`${p.id} · ${p.name}`, value:p.id})),[products]);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map(o=>{
          const on = selected.includes(o.value);
          return (
            <button type="button" key={o.value}
              onClick={()=> onChange(on? selected.filter(v=>v!==o.value):[...selected,o.value])}
              className={`px-3 py-1 rounded-2xl border ${on?"bg-black text-white":""}`}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}