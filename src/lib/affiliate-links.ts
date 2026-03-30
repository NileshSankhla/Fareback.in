import { readFileSync, statSync } from "fs";
import { resolve } from "path";
import * as XLSX from "xlsx";

let cachedLinks: string[] | null = null;
let cachedMtimeMs: number | null = null;

const AMAZON_LINK_TEMPLATE = "https://www.amazon.in?linkCode=ll2&ref_=as_li_ss_tl";
const AMAZON_AFFILIATE_BASE_URL =
  process.env.AMAZON_AFFILIATE_BASE_URL ||
  "https://www.amazon.in?&linkCode=ll2&tag=fareback-21&linkId=711b78face92a1bf8be6139d25b1f780&ref_=as_li_ss_tl";

const sanitizeAmazonTag = (rawTag: string): string => {
  const normalized = rawTag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const withFallback = normalized || "affiliate";
  if (/-\d{2}$/.test(withFallback)) {
    return withFallback;
  }

  return `${withFallback}-21`;
};

const normalizeAffiliateLink = (rawValue: string): string | null => {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }

  // If it's already a full URL, use it directly.
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Not a URL, treat it as an affiliate tag.
  }

  // Fallback only for non-URL values; full URLs from Excel are always preserved as-is.
  const url = new URL(AMAZON_AFFILIATE_BASE_URL || AMAZON_LINK_TEMPLATE);
  url.searchParams.set("tag", sanitizeAmazonTag(value));
  return url.toString();
};

/**
 * Loads Amazon affiliate links from the Excel file
 * Expected format: First column contains affiliate URLs
 */
export function loadAmazonAffiliateLinks(): string[] {
  try {
    const filePath = resolve(process.cwd(), "amazonlinks.xlsx");
    const mtimeMs = statSync(filePath).mtimeMs;

    if (cachedLinks && cachedMtimeMs === mtimeMs) {
      return cachedLinks;
    }

    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // Read the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in Excel file");
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
    });

    // Extract first column (affiliate links)
    const links = rows
      .map((row) => (Array.isArray(row) ? row[0] : row))
      .filter((link): link is string => {
        return typeof link === "string" && link.trim().length > 0;
      })
      .map((link) => normalizeAffiliateLink(link))
      .filter((link): link is string => Boolean(link));

    if (links.length === 0) {
      throw new Error("No affiliate links found in Excel file");
    }

    console.log(`Loaded ${links.length} Amazon affiliate links from Excel`);
    cachedLinks = links;
    cachedMtimeMs = mtimeMs;
    return cachedLinks;
  } catch (error) {
    console.error("Failed to load Amazon affiliate links:", error);
    throw new Error(
      `Failed to load Amazon affiliate links: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get a specific affiliate link by index
 */
export function getAffiliateLink(index: number): string {
  const links = loadAmazonAffiliateLinks();
  const normalizedIndex = index % links.length;
  return links[normalizedIndex];
}

/**
 * Get total number of affiliate links
 */
export function getTotalAffiliateLinks(): number {
  return loadAmazonAffiliateLinks().length;
}
