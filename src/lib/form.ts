// All contact submissions now go through the same-origin /api/contact route,
// which persists to the Convex inbox (read by the admin console) and forwards a
// copy to Formspark for the email notification. Callers pass a `category`
// (bug | feature | enterprise | pricing | general) so the inbox stays sorted.
export async function submitForm(data: Record<string, unknown>) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Form submission failed");
  }

  return response.json();
}
