import { Check, X } from "lucide-react";
import { cn } from "@/common/lib/utils";

interface CheckItem {
  label: string;
  valid: boolean;
}

interface PasswordChecklistProps {
  password: string;
  confirmPassword: string;
}

export const PasswordChecklist = ({
  password,
  confirmPassword,
}: PasswordChecklistProps) => {
  const checks: CheckItem[] = [
    {
      label: "Password has at least 8 characters.",
      valid: password.length >= 8,
    },
    {
      label: "Password has a number.",
      valid: /[0-9]/.test(password),
    },
    {
      label: "Password has an uppercase letter.",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Password has a lowercase letter.",
      valid: /[a-z]/.test(password),
    },
    {
      label: "Passwords match.",
      valid: !!confirmPassword && password === confirmPassword,
    },
  ];

  return (
    <ul data-testid="password-checklist" className="flex flex-col gap-2">
      {checks.map(({ label, valid }) => (
        <li key={label} className="flex items-center gap-2">
          {valid ? (
            <Check data-testid="check-icon" size={16} className="shrink-0 text-green" />
          ) : (
            <X data-testid="x-icon" size={16} className="shrink-0 text-red" />
          )}
          <span
            className={cn(
              "typo-third text-[14px]",
              valid ? "text-ui-black font-medium" : "text-grey",
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
};