"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdAccountOption {
  id: string;
  name: string;
}

export function AccountSelector({
  accounts,
}: {
  accounts: AdAccountOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAccount = searchParams.get("account") || "all";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("account");
    } else {
      params.set("account", value);
    }
    router.push(`/?${params.toString()}`);
  }

  if (accounts.length < 2) return null;

  return (
    <Select value={currentAccount} onValueChange={handleChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="All accounts" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
