"use client";

import React from 'react';

export function SimpleTable<T>({ items, renderRow }:{ items: T[]; renderRow: (item: T)=>React.ReactNode }){
  return (
    <div className="w-full overflow-auto">
      <table className="w-full table-auto text-sm">
        <tbody>
          {items.map((it, idx)=> (
            <tr key={idx} className="border-b">
              <td className="p-3">{renderRow(it)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
