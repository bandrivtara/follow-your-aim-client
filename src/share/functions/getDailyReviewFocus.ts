import { IDailyReview } from "types/dailyReview.types";

/** Read the final focus section without rewriting current or legacy reviews. */
export const getDailyReviewFocus = (value: unknown): string => {
  if (!value || typeof value !== "object") return "";
  const review = value as Partial<IDailyReview>;

  if (typeof review.summary === "string") {
    // Accept plain text and Markdown labels, including the AI prompt's
    // "ФОКУС ЗАВТРА:". Use the last marker if the pasted text repeats it.
    const marker =
      /(?:^|\s)[*_]*фокус(?:[ \t]+(?:на[ \t]+)?завтра)?[*_]*[ \t]*:[ \t]*[*_]*[ \t]*/gi;
    let focusStart: number | undefined;
    while (marker.exec(review.summary)) focusStart = marker.lastIndex;

    if (focusStart !== undefined) {
      return review.summary.slice(focusStart).trim();
    }
  }

  const legacyFocus = review.answers?.tomorrow;
  return typeof legacyFocus === "string" ? legacyFocus.trim() : "";
};
