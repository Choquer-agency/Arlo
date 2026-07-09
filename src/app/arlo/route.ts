// /arlo was the homepage during the redesign; it now lives at /. Redirect so any
// existing links still resolve. The arlo/ folder remains the shared render library.
export function GET(req: Request) {
  return Response.redirect(new URL("/", req.url), 308);
}
