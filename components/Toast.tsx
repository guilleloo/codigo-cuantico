"use client";

import { useCallback, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState("");
  const flash = useCallback((msg: string, ms = 2000) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(""), ms);
  }, []);
  return { message, flash };
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="toast">
      <span className="dotg" />
      {message}
    </div>
  );
}
