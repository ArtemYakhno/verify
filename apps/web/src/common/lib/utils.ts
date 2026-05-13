import { extendTailwindMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "typo-h1",
        "typo-h2",
        "typo-h3",
        "typo-main",
        "typo-secondary",
        "typo-third",
        "typo-button",
        "typo-input",
        "typo-nav",
        "typo-link",
        "typo-small",
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
