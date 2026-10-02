"use client";

import { Printer } from "lucide-react";
import { Button } from "./ui";

export function PrintButton({ fileName }: { fileName: string }) {
  function print() {
    const previous = document.title;
    document.title = fileName;
    window.print();
    setTimeout(() => {
      document.title = previous;
    }, 500);
  }

  return (
    <Button type="button" onClick={print}>
      <Printer className="h-4 w-4" /> Descargar PDF
    </Button>
  );
}
