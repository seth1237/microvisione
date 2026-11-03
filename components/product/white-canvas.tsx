"use client";

import { useEffect } from "react";

/** Product pages sit on white, including the area the site gradient would otherwise show. */
export function WhiteCanvas() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.background;
    const previousBody = body.style.background;
    html.style.background = "#ffffff";
    body.style.background = "#ffffff";
    return () => {
      html.style.background = previousHtml;
      body.style.background = previousBody;
    };
  }, []);
  return null;
}
