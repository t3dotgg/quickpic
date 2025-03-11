export const HTTP_ERROR_CODES = new Map<number, string>([
  [400, "Bad Request"],
  [401, "Unauthorized"],
  [402, "Payment Required"],
  [403, "Forbidden"],
  [404, "Not Found"],
  [405, "Method Not Allowed"],
  [406, "Not Acceptable"],
  [407, "Proxy Authentication Required"],
  [408, "Request Timeout"],
  [409, "Conflict"],
  [410, "Gone"],
  [411, "Length Required"],
  [412, "Precondition Failed"],
  [413, "Payload Too Large"],
  [414, "URI Too Long"],
  [415, "Unsupported Media Type"],
  [416, "Range Not Satisfiable"],
  [417, "Expectation Failed"],
  [418, "I'm a teapot"],
  [421, "Misdirected Request"],
  [422, "Unprocessable Entity"],
  [423, "Locked"],
  [424, "Failed Dependency"],
  [425, "Too Early"],
  [426, "Upgrade Required"],
  [428, "Precondition Required"],
  [429, "Too Many Requests"],
  [431, "Request Header Fields Too Large"],
  [450, "Blocked by Windows Parental Controls"],
  [451, "Unavailable For Legal Reasons"],
  [500, "Internal Server Error"],
  [501, "Not Implemented"],
  [502, "Bad Gateway"],
  [503, "Service Unavailable"],
  [504, "Gateway Timeout"],
  [505, "HTTP Version Not Supported"],
  [506, "Variant Also Negotiates"],
  [507, "Insufficient Storage"],
  [508, "Loop Detected"],
  [509, "Bandwidth Limit Exceeded"],
  [510, "Not Extended"],
  [511, "Network Authentication Required"],
  [520, "Cloudflare Web Server Returned an Unknown Error"],
  [521, "Cloudflare Web Server Is Down"],
  [522, "Cloudflare Connection Timed Out"],
  [523, "Cloudflare Origin Is Unreachable"],
  [524, "Cloudflare Timeout Occurred"],
  [525, "Cloudflare SSL Handshake Failed"],
  [598, "Network Read Timeout Error"],
  [599, "Network Connect Timeout Error"],
]);

const REGEX_URL = new RegExp(
  "^(https?:\\/\\/)?" + // protocol (optional)
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // or, IPv4 address
    "(\\:\\d+)?" + // port (optional)
    "(\\/[-a-z\\d%_.~+=]*)*" + // path string (at least one "/" will be in a valid resource)
    "(\\?[^#]*)?" + // query string (optional)
    "(\\#[-a-z\\d_]*)?$", // URL fragment (optional)
  "i",
);

export function validateUrl(input: string) {
  const trimmedInput = input.trim();

  if (!trimmedInput || !REGEX_URL.test(trimmedInput)) return null;

  try {
    const url = new URL(
      trimmedInput.startsWith("http")
        ? trimmedInput
        : `https://${trimmedInput}`,
    );
    return url.href;
  } catch {
    return null;
  }
}
