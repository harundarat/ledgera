<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ledgera-design-system -->
# Ledgera design system

- Use HeroUI v3 from `@heroui/react` for UI primitives. Do not add shadcn, Base UI, or another component system.
- Read the local `heroui-react` skill and current HeroUI MCP documentation before using or customizing a component.
- Use semantic HeroUI tokens such as `background`, `surface`, `default`, `accent`, `muted`, `danger`, and `border`. Do not hardcode product colors in component files.
- Every new screen and component must work in both light and dark themes. The light-blue `accent` is reserved for primary actions, active controls, and focus emphasis; content rendered on solid `accent` backgrounds must use the white `accent-foreground`.
- Follow the established geometry: pill-shaped buttons, approximately 12px field radius, and approximately 24px card radius. Use subtle shadows in light mode and flat surfaces in dark mode.
- Use Geist Sans for interface copy and headings. Prefer medium or semibold weight over decorative typefaces.
<!-- END:ledgera-design-system -->
