import { LinkIcon } from "@/components/shared/icons";

function Spinner() {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Loading…"
      className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-transparent [animation:spin_1s_linear_infinite]"
    />
  );
}

type FetchFromUrlFormProps = {
  accept:
    | ".svg"
    | "image/svg+xml"
    | "image/*"
    | ".jpg"
    | ".jpeg"
    | ".png"
    | ".webp";
  error: string | null;
  handleSubmit: (payload: FormData) => void;
  pending: boolean;
};

export function FetchFromUrlForm({
  accept,
  error,
  handleSubmit,
  pending,
}: FetchFromUrlFormProps) {
  return (
    <div className="flex w-full max-w-container flex-col items-center gap-4 sm:w-container">
      <form
        action={handleSubmit}
        className="flex w-full items-center gap-2"
        autoComplete="off"
        noValidate
      >
        <div className="group relative min-w-0 grow">
          <input
            type="text"
            name="url"
            placeholder="https://"
            className="focus-visible:ring-offset-none h-10 w-full min-w-0 rounded-lg bg-white/5 py-2 pl-9 pr-3 text-sm font-medium text-gray-500 transition-colors duration-200 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 group-focus-within:text-white group-hover:text-white"
            autoComplete="off"
            required
            {...(error && {
              "aria-invalid": true,
              "aria-errormessage": "error-message",
              "aria-describedby": "error-message",
            })}
          />
          <LinkIcon className="absolute left-2 top-2.5 size-5 text-gray-500" />
        </div>
        <input type="hidden" name="accept" value={accept} />
        <button
          type="submit"
          disabled={pending}
          className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
        >
          {pending ? <Spinner /> : "or, use URL"}
        </button>
      </form>
    </div>
  );
}
