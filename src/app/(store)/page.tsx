import { getHomeData } from "@/lib/home-data";
import HomeLayout from "@/components/home/HomeLayout";

export const revalidate = 3600; // ISR: 1 hour — static marketing page with periodic updates

export default async function Home() {
  const data = await getHomeData();

  return (
    <main>
      <HomeLayout data={data} />
    </main>
  );
}
