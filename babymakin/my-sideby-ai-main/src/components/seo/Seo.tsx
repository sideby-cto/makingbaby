import { useEffect } from "react";

type JsonLd = Record<string, any> | Record<string, any>[];

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: JsonLd;
  image?: string;
  ogType?: string;
  noIndex?: boolean;
}

function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setPropertyMeta(property: string, content: string) {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(id: string, data?: JsonLd) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = id;
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

export function Seo({ title, description, canonical, jsonLd, image, ogType = "website", noIndex = false }: SeoProps) {
  useEffect(() => {
    const hasBrand = /\bsideby\b/i.test(title);
    const finalTitle = hasBrand ? title : `${title} | sideby`;
    document.title = finalTitle;

    const url = (() => {
      try {
        const { origin, pathname } = window.location;
        return canonical || `${origin}${pathname}`;
      } catch {
        return canonical || "";
      }
    })();

    if (description) setMeta("description", description);
    if (noIndex) setMeta("robots", "noindex, nofollow");

    // Open Graph & Twitter basics
    setPropertyMeta("og:title", finalTitle);
    if (description) setPropertyMeta("og:description", description);
    if (url) setPropertyMeta("og:url", url);
    setPropertyMeta("og:type", ogType);
    if (image) setPropertyMeta("og:image", image);

    setMeta("twitter:card", image ? "summary_large_image" : "summary");
    setMeta("twitter:title", finalTitle);
    if (description) setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);

    if (url) setLink("canonical", url);

    setJsonLd("seo-structured-data", jsonLd);
  }, [title, description, canonical, JSON.stringify(jsonLd), image, ogType, noIndex]);

  return null;
}
