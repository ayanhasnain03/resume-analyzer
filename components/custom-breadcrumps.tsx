"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SegmentOverride =
  | string
  | {
      label?: string;
      href?: string;
      hidden?: boolean;
    };

type Overrides = Record<string, SegmentOverride>;

type IdDisplay =
  | { mode: "keep" }
  | { mode: "truncate"; length?: number }
  | { mode: "hash"; prefix?: string };

export type BreadcrumbsProps = {
  maxItems?: number;
  rootLabel?: string;
  rootHref?: string;
  overrides?: Overrides;
  idDisplay?: IdDisplay;
  localePrefix?: string;
  formatLabel?: (rawSegment: string, index: number, parts: string[]) => string;
  buildHref?: (parts: string[], index: number) => string;
  hideRoot?: boolean;
};

const isLikelyId = (s: string) =>
  /^[0-9a-f]{8,}$/i.test(s.replace(/-/g, "")) || /^[0-9]{6,}$/.test(s);

const defaultTitleCase = (str: string) =>
  str
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

function applyIdDisplay(raw: string, idDisplay: IdDisplay): string {
  if (!isLikelyId(raw)) return raw;
  if (idDisplay.mode === "keep") return raw;
  if (idDisplay.mode === "hash") {
    const prefix = idDisplay.prefix ?? "#";
    return `${prefix}${raw.slice(0, 8)}`;
  }
  const len = idDisplay.length ?? 8;
  return `${raw.slice(0, len)}…`;
}

export function CustomBreadcrumbs({
  maxItems = 4,
  rootLabel = "Home",
  rootHref = "/",
  overrides,
  idDisplay = { mode: "truncate", length: 8 },
  localePrefix,
  formatLabel,
  buildHref,
  hideRoot = false,
}: BreadcrumbsProps) {
  const pathname = usePathname() || "/";

  const { parts, cumulativeHrefs, visibleParts, overflowParts } =
    React.useMemo(() => {
      const raw =
        pathname.endsWith("/") && pathname !== "/"
          ? pathname.slice(0, -1)
          : pathname;
      const stripped =
        localePrefix && raw.startsWith(`/${localePrefix}/`)
          ? raw.replace(`/${localePrefix}`, "") || "/"
          : raw;

      const all = stripped.split("/").filter(Boolean);
      const hrefs = all.map((_, i) => `/${all.slice(0, i + 1).join("/")}`);

      let visible = all;
      let overflow: { label: string; href: string }[] = [];

      if (all.length > maxItems) {
        const head = [all[0]];
        const tail = all.slice(-(maxItems - 1 || 1));
        const overflowRaw = all.slice(1, all.length - tail.length);
        overflow = overflowRaw.map((seg, i) => ({
          label: seg,
          href: `/${all.slice(0, i + 2).join("/")}`,
        }));
        visible = [...head, "...", ...tail];
      }

      return {
        parts: all,
        cumulativeHrefs: hrefs,
        visibleParts: visible,
        overflowParts: overflow,
      };
    }, [pathname, maxItems, localePrefix]);

  const items = React.useMemo(() => {
    const fmt =
      formatLabel ??
      ((seg: string) =>
        defaultTitleCase(applyIdDisplay(decodeURIComponent(seg), idDisplay)));

    const resolveOverride = (
      seg: string
    ): Exclude<SegmentOverride, string> | null => {
      const o = overrides?.[seg];
      if (!o) return null;
      if (typeof o === "string") return { label: o };
      return o;
    };

    return visibleParts.map((seg, idx) => {
      if (seg === "...") return { type: "ellipsis" as const };

      // Map this visible segment to its cumulative index in `parts`
      const cumulativeIndex = parts.findIndex(
        (_, i) =>
          `/${parts.slice(0, i + 1).join("/")}` ===
          `/${parts.slice(0, idx + 1).join("/")}`
      );
      const index = cumulativeIndex === -1 ? idx : cumulativeIndex;

      const href =
        buildHref?.(parts, index) ??
        cumulativeHrefs[index] ??
        `/${parts.slice(0, index + 1).join("/")}`;

      const override = resolveOverride(seg);
      if (override?.hidden) return { type: "hidden" as const };

      const label = override?.label ?? fmt(seg, index, parts);
      const finalHref = override?.href ?? href;

      return { type: "segment" as const, label, href: finalHref };
    });
  }, [
    visibleParts,
    parts,
    cumulativeHrefs,
    overrides,
    formatLabel,
    idDisplay,
    buildHref,
  ]);

  const overflowMenu = React.useMemo(() => {
    const fmt =
      formatLabel ??
      ((seg: string) =>
        defaultTitleCase(applyIdDisplay(decodeURIComponent(seg), idDisplay)));
    return overflowParts
      .map(({ label: seg, href }, i) => {
        const o = overrides?.[seg];
        if (o === undefined) return { label: fmt(seg, i + 1, parts), href };
        if (typeof o === "string") return { label: o, href };
        if (o.hidden) return null;
        return {
          label: o.label ?? fmt(seg, i + 1, parts),
          href: o.href ?? href,
        };
      })
      .filter(Boolean) as { label: string; href: string }[];
  }, [overflowParts, overrides, formatLabel, idDisplay, parts]);

  const renderSeparator = (key: string) => (
    <BreadcrumbSeparator key={`sep-${key}`} />
  );

  if (!items.length && hideRoot) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {!hideRoot && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={rootHref}>{rootLabel}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {items.length > 0 && renderSeparator("root")}
          </>
        )}

        {items.map((it, i) => {
          if (it.type === "hidden") return null;

          const isLast = i === items.length - 1;

          if (it.type === "ellipsis") {
            return (
              <React.Fragment key={`ellipsis-${i}`}>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 outline-none">
                      <BreadcrumbEllipsis />
                      <span className="sr-only">Open breadcrumb menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {overflowMenu.map((m) => (
                        <DropdownMenuItem key={m.href} asChild>
                          <Link href={m.href}>{m.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                {!isLast && renderSeparator(`ellipsis-${i}`)}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={it.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{it.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={it.href}>{it.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && renderSeparator(it.href)}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
