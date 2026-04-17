export async function submitForm(data: Record<string, unknown>) {
  const formId = process.env.NEXT_PUBLIC_FORMSPARK_ID;
  if (!formId) {
    throw new Error("NEXT_PUBLIC_FORMSPARK_ID is not configured");
  }

  const response = await fetch(`https://submit-form.com/${formId}`, {
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
