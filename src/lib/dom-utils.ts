type InteractiveElementTagName =
  | "ALL"
  | "INPUT"
  | "TEXTAREA"
  | "SELECT"
  | "BUTTON"
  | "A";

const defaultTagNames: InteractiveElementTagName[] = [
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "A",
];
/**
 * Checks whether any elements in the document are currently focused.
 * By default, all types of interactive elements are checked, but the
 * set of elements to check can be overriden by passing an element's
 * tag name as a string, or an array of valid tag name strings.
 */
export function isInteractiveElementFocused(
  tagNames:
    | InteractiveElementTagName
    | InteractiveElementTagName[] = defaultTagNames,
  classNames?: string | string[],
): boolean {
  const tagNamesToTest =
    tagNames === "ALL"
      ? defaultTagNames
      : Array.isArray(tagNames)
        ? tagNames
        : [tagNames];
  const classNamesToTest = Array.isArray(classNames)
    ? classNames
    : [classNames];
  const activeEl = document.activeElement;

  return (
    activeEl instanceof HTMLElement &&
    (activeEl.isContentEditable ||
      tagNamesToTest.includes(activeEl.tagName as InteractiveElementTagName) ||
      classNamesToTest.some(
        (className) => className && activeEl.classList.contains(className),
      ))
  );
}
