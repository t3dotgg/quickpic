import { WarningIcon } from "@/components/shared/icons";

type ErrorMessageProps = {
  error: string;
};

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <p
      id="error-message"
      role="alert"
      aria-live="assertive"
      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-red-500"
    >
      <WarningIcon />
      {error}
    </p>
  );
}
