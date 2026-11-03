import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Account",
  robots: utilityRobots,
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
