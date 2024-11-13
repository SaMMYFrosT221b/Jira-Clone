export function GET(res: Request, params: { params: { userId: string } }) {
  return Response.json({
    name: "Sammy Frost",
    age: 30,
    userId: params.params.userId,
  });
}
