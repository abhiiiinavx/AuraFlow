import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "@/store/uiStore";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const setCommandOpen = useUiStore((state) => state.setCommandOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key.toLowerCase() === "d") navigate("/");
      if (event.key.toLowerCase() === "t") navigate("/tasks");
      if (event.key.toLowerCase() === "a") navigate("/analytics");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, setCommandOpen]);
}
