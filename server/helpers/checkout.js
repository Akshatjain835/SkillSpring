export function normalizeCheckoutAmount(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Number(parsed.toFixed(2));
}

export function getApprovalLink(response) {
  const links = response?.result?.links || [];
  return links.find((link) => link?.rel === "approve")?.href || null;
}
