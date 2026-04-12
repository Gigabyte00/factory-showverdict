import { Info } from 'lucide-react';

/**
 * FTC-compliant affiliate disclosure component.
 *
 * The FTC requires disclosures to be "clear and conspicuous" — readers must be
 * able to easily notice and understand them. Small, faded text fails this test.
 * This component uses 13px text at full opacity with a visible icon.
 *
 * Reference: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
 */
export default function AffiliateDisclosure() {
  return (
    <div
      className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground max-w-2xl mx-auto py-3 px-4 rounded-md bg-muted/40"
      role="note"
      aria-label="Affiliate disclosure"
    >
      <Info className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p className="text-center">
        <strong>Affiliate Disclosure:</strong> This page contains affiliate links. We may earn a commission when you purchase through these links, at no extra cost to you.
      </p>
    </div>
  );
}
