"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const PrivyProvider = dynamic(
  () => import("@privy-io/react-auth").then((mod) => mod.PrivyProvider),
  { ssr: false }
);

type Props = {
  children: ReactNode;
};

export function PrivyProviderClient(props: Props) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#ff6ad5",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {props.children}
    </PrivyProvider>
  );
}
