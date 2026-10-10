import { redirect } from "next/navigation";

export default async function SimulatorRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const lot = params?.lot || params?.room;
  if (lot && typeof lot === "string") {
    redirect(`/?lot=${encodeURIComponent(lot)}`);
  }
  redirect("/");
}
