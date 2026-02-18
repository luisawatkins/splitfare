 "use client";

import type React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

type Props = {
  children: React.ReactNode;
};

export function PrivyProviderClient(props: Props) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#ff6ad5"
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets"
          }
        }
      }}
    >
      {props.children}
    </PrivyProvider>
  );
}
