import { useActionState, useEffect } from "react";
import { useProcessFile } from "./use-process-file";
import { HTTP_ERROR_CODES, validateUrl } from "@/lib/fetch-utils";

export type FileFetcherResult = {
  /** The processed image content as a data URL (for regular images) or object URL (for SVGs) */
  imageContent: string;
  /** The raw file content as a string */
  rawContent: string;
  /** Metadata about the uploaded image including dimensions and filename */
  imageMetadata: {
    width: number;
    height: number;
    name: string;
  } | null;
  /** Handler for form state change */
  handleFetchFile: (payload: FormData) => void;
  /** Pending state while submitting form */
  pending: boolean;
  /** Error message in case of a failed fetch */
  error: string | null;
  /** Resets the upload state */
  cancel: () => void;
};

type FileFetcherFormState = Pick<FileFetcherResult, "error">;

type FileFetcherOptions = {
  onError?: (error: string) => void;
};

export function useFileFetcher({ onError }: FileFetcherOptions = {}) {
  const { imageContent, rawContent, imageMetadata, processFile, cancel } =
    useProcessFile({ onError });

  const [state, handleFetchFile, pending] = useActionState<
    FileFetcherFormState,
    FormData
  >(
    async (_, formData: FormData): Promise<FileFetcherFormState> => {
      const input = formData.get("url") as string;
      const accept = formData.get("accept") as string | null;

      if (!input) return { error: "URL is required." };
      if (!accept) return { error: "Image has invalid or missing MIME type." };

      const validUrl = validateUrl(input);
      if (!validUrl)
        return { error: "Invalid URL. Please check and try again." };

      try {
        const response = await fetch(validUrl);

        if (!response.ok) {
          switch (response.status) {
            case 400:
              return {
                error: "Invalid request. Please check the URL and try again.",
              };
            case 403:
              return {
                error:
                  "Forbidden—you don't have permission to access this resource.",
              };
            case 404:
              return { error: "Image not found. Please check the URL." };
            case 500:
              return { error: "Server error. Please try again later." };
            case 503:
              return { error: "Service unavailable. Please try again later." };
            default:
              let errorMessage = response.status + "";
              if (HTTP_ERROR_CODES.has(response.status))
                errorMessage += ` ${HTTP_ERROR_CODES.get(response.status)}`;
              return {
                error: `Failed to retrieve image (Error: ${errorMessage}).`,
              };
          }
        }

        const fileType = response.headers.get("Content-Type") ?? "";

        if (!fileType.startsWith("image/")) {
          return {
            error: `Requested file is not an image. Please upload a valid image file.`,
          };
        }

        let fileExt = "",
          fileContent: string | ArrayBuffer;

        if (fileType.startsWith("image/")) {
          fileExt = fileType.split("/").pop() ?? "";
          if (fileExt === "jpeg") fileExt = "jpg"; // normalize jpg extension
          if (fileExt === "svg+xml") fileExt = "svg"; // normalize svg extension
        }

        const isSvg = fileType === "image/svg+xml";
        const isValidType =
          accept === "image/*" ||
          fileType.startsWith(accept) ||
          (accept.includes(".svg") && isSvg);

        if (!isValidType) {
          return {
            error: `Requested image has invalid type. Valid types are: ${accept}.`,
          };
        }

        const fileName =
          new URL(validUrl).pathname.split("/").pop()?.split(".")[0] ?? "image";
        const fileNameWithExt = `${fileName}.${fileExt}`;

        if (isSvg) {
          fileContent = await response.text();
        } else {
          fileContent = await response.arrayBuffer();
        }

        const tempFile = new File([fileContent], fileNameWithExt, {
          type: fileType,
        });

        await processFile(tempFile);
        return { error: null }; // Success, reset error state
      } catch (err) {
        if (
          err instanceof TypeError &&
          err.message.includes("Failed to fetch")
        ) {
          return {
            error:
              "CORS Error: The requested resource does not allow cross-origin requests.",
          };
        } else if (err instanceof Error) {
          if (err.message.includes("ERR_CERT_AUTHORITY_INVALID")) {
            return {
              error:
                "Invalid certificate. Try using http:// instead of https://.",
            };
          } else if (
            err.message.includes("ERR_FAILED") &&
            err.message.includes("301")
          ) {
            return { error: "The requested image has been moved permanently." };
          } else if (err.message.includes("Failed to fetch")) {
            return {
              error: "Network error—the resource may be down or unreachable.",
            };
          }
        }

        return { error: "Unknown error. Please try again." };
      }
    },
    { error: null }, // Initial state, no form error
  );

  useEffect(() => {
    if (state.error) {
      if (onError) onError(state.error);
      else alert(state.error);
    }
  }, [state.error, onError]);

  return {
    imageContent,
    rawContent,
    imageMetadata,
    handleFetchFile,
    pending,
    error: state.error,
    cancel,
  };
}
