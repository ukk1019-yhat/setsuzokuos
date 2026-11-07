# THIRD-PARTY SOFTWARE LICENSES & ASSET DISCLOSURES

**Last Audited:** November 2026  
**Project:** Setsuzoku OS  
**Fiduciary:** Setsuzoku Media Labs Private Limited  

This document lists all third-party open-source libraries, frameworks, fonts, and assets incorporated into or used in the development and runtime operation of Setsuzoku OS, along with their respective license types and copyright notices.

---

## 1. Compliance Audit & Certification

- **Viral Copyleft Audit:** Zero dependencies are licensed under GNU General Public License (GPLv1/v2/v3), Affero General Public License (AGPLv1/v3), or European Union Public License (EUPL).
- **Commercial Use Verification:** 100% of runtime and build dependencies use permissive, commercial-use compliant licenses (MIT, Apache-2.0, ISC, BSD-2-Clause, SIL Open Font License 1.1).
- **Asset Provenance:** All UI icons originate from the licensed open-source Lucide icon suite. All typography is served under the SIL Open Font License.

---

## 2. Runtime & Application Libraries

### Web Application (`@setsuzoku/web`)

| Package | Version | License | Source / Repository | Copyright / Author |
| :--- | :--- | :--- | :--- | :--- |
| `react` | `^18.3.1` | MIT | https://github.com/facebook/react | Meta Platforms, Inc. and affiliates |
| `react-dom` | `^18.3.1` | MIT | https://github.com/facebook/react | Meta Platforms, Inc. and affiliates |
| `react-router-dom` | `^6.23.1` | MIT | https://github.com/remix-run/react-router | Remix Software Inc. |
| `lucide-react` | `^0.379.0` | ISC | https://github.com/lucide-icons/lucide | Lucide Project Contributors |
| `@tanstack/react-query` | `^5.39.0` | MIT | https://github.com/TanStack/query | Tanner Linsley |
| `clsx` | `^2.1.1` | MIT | https://github.com/lukeed/clsx | Luke Edwards |
| `tailwind-merge` | `^2.3.0` | MIT | https://github.com/dcastil/tailwind-merge | Dany Castillo |

### API Backend (`@setsuzoku/api`)

| Package | Version | License | Source / Repository | Copyright / Author |
| :--- | :--- | :--- | :--- | :--- |
| `express` | `^4.19.2` | MIT | https://github.com/expressjs/express | StrongLoop, Inc. & TJ Holowaychuk |
| `cors` | `^2.8.5` | MIT | https://github.com/expressjs/cors | Troy Goode |
| `helmet` | `^7.1.0` | MIT | https://github.com/helmetjs/helmet | Evan Hahn |
| `cookie-parser` | `^1.4.6` | MIT | https://github.com/expressjs/cookie-parser | TJ Holowaychuk & Douglas Christopher Wilson |
| `bcryptjs` | `^2.4.3` | MIT | https://github.com/dcodeIO/bcrypt.js | Daniel Wirtz |
| `jsonwebtoken` | `^9.0.2` | MIT | https://github.com/auth0/node-jsonwebtoken | Auth0, Inc. |
| `dotenv` | `^16.4.5` | BSD-2-Clause | https://github.com/motdotla/dotenv | Scott Motte |
| `zod` | `^3.23.8` | MIT | https://github.com/colinhacks/zod | Colin McDonnell |

### Database & Schema (`@setsuzoku/database`, `@setsuzoku/shared`)

| Package | Version | License | Source / Repository | Copyright / Author |
| :--- | :--- | :--- | :--- | :--- |
| `@prisma/client` | `^5.14.0` | Apache-2.0 | https://github.com/prisma/prisma | Prisma Data, Inc. |
| `prisma` | `^5.14.0` | Apache-2.0 | https://github.com/prisma/prisma | Prisma Data, Inc. |
| `zod` | `^3.23.8` | MIT | https://github.com/colinhacks/zod | Colin McDonnell |

---

## 3. Build Tools & Developer Tooling

| Tool | License | Source / Repository | Purpose |
| :--- | :--- | :--- | :--- |
| `typescript` | Apache-2.0 | https://github.com/microsoft/TypeScript | Static type system and compiler |
| `vite` | MIT | https://github.com/vitejs/vite | Modern web application bundler |
| `esbuild` | MIT | https://github.com/evanw/esbuild | JavaScript/TypeScript API bundler |
| `vitest` | MIT | https://github.com/vitest-dev/vitest | Unit and integration test runner |
| `supertest` | MIT | https://github.com/ladjs/supertest | HTTP assertions for API testing |
| `tailwindcss` | MIT | https://github.com/tailwindlabs/tailwindcss | Utility-first CSS framework |
| `autoprefixer` | MIT | https://github.com/postcss/autoprefixer | CSS vendor prefix post-processor |
| `postcss` | MIT | https://github.com/postcss/postcss | Tool for transforming styles with JS |
| `tsx` | MIT | https://github.com/privatenumber/tsx | TypeScript execute and watch engine |

---

## 4. Typography & Font Licenses

| Typeface | Style / Weights | License | Designer / Foundry | Distribution Source |
| :--- | :--- | :--- | :--- | :--- |
| **Plus Jakarta Sans** | Regular (400), Medium (500), SemiBold (600), Bold (700) | SIL Open Font License 1.1 (OFL) | Tokotype (Gumpita Rahayu) | Google Fonts (`fonts.googleapis.com`) |

### SIL Open Font License 1.1 Summary
Permission is hereby granted, free of charge, to any person obtaining a copy of the Font Software, to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software, subject to standard conditions of attribution.

---

## 5. Iconography & Visual Assets

| Asset Collection | License | Creator / Maintainer | Source |
| :--- | :--- | :--- | :--- |
| **Lucide Icons** | ISC License | Lucide Project (forked from Feather Icons by Cole Bemis) | https://lucide.dev |

### ISC License Notice
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the copyright notice and this permission notice appear in all copies.

---

## 6. Proprietary Brand Assets Notice

The Setsuzoku wordmark, stylized high-fiving figures device, Setsuzoku Media Labs crest, and related product design assets stored under `brand/` are the proprietary trademarks and copyright of Setsuzoku Media Labs Private Limited. They are excluded from open-source licensing and may not be reproduced, modified, or redistributed without prior written consent.

---

For licensing queries or notifications: **info@setsuzoku.in**

