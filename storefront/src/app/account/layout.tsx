import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description: "View your account details and orders.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="content-container">
      <div className="flex flex-col py-6">
        <div className="flex flex-col gap-y-8 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
