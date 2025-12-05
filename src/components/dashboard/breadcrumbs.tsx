"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Breadcrumbs() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering breadcrumbs only after mount
  if (!isMounted) {
    return null;
  }

  const segments = pathname.split("/").filter((segment) => segment);
  
  // Label mapping for better display names
  const labelMap: Record<string, string> = {
    admin: "Dashboard",
  };

  const getLabel = (segment: string) => {
    return labelMap[segment] || segment;
  };

  // For /admin, show just "Dashboard"
  if (pathname === "/admin" || pathname === "/app") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // For sub-routes like /admin/users, show "Dashboard > Users"
  const currentPageLabel = segments.length > 0 
    ? getLabel(segments[segments.length - 1])
    : "";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={pathname === "/admin" ? "/admin" : "/app"}>Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {currentPageLabel.length > 20 ? (
              <span>{currentPageLabel}</span>
            ) : (
              <span className="capitalize">{currentPageLabel}</span>
            )}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
