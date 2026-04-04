"use client";

import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => children;

export default Providers;
