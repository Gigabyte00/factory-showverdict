'use client';

import { ReactNode } from 'react';

interface SpeakableSectionProps {
  /**
   * Unique identifier for this speakable section.
   * Used for schema.org cssSelector targeting.
   */
  id: string;
  /**
   * The content to render inside the speakable section.
   */
  children: ReactNode;
  /**
   * Optional CSS class for styling.
   */
  className?: string;
  /**
   * Whether this is the primary/headline speakable section.
   * Primary sections get higher priority for voice assistants.
   */
  isPrimary?: boolean;
  /**
   * Optional label for screen readers and AI context.
   */
  ariaLabel?: string;
}

/**
 * SpeakableSection Component
 *
 * Wraps content that should be optimized for voice assistants and AI extraction.
 * Uses data attributes that are referenced by the Article schema's speakable property.
 *
 * Schema.org Speakable specification:
 * https://schema.org/speakable
 *
 * Usage:
 * ```tsx
 * <SpeakableSection id="key-answer" isPrimary>
 *   The best electric bike for commuting is the RadCity 5 Plus,
 *   offering 45-mile range and a comfortable upright position.
 * </SpeakableSection>
 * ```
 *
 * The corresponding JsonLd should include:
 * ```json
 * {
 *   "@type": "Article",
 *   "speakable": {
 *     "@type": "SpeakableSpecification",
 *     "cssSelector": ["#key-answer", "#summary"]
 *   }
 * }
 * ```
 */
export function SpeakableSection({
  id,
  children,
  className = '',
  isPrimary = false,
  ariaLabel,
}: SpeakableSectionProps) {
  return (
    <section
      id={id}
      className={`speakable-section ${isPrimary ? 'speakable-primary' : ''} ${className}`}
      data-speakable="true"
      data-speakable-priority={isPrimary ? 'high' : 'normal'}
      aria-label={ariaLabel}
      role="region"
    >
      {children}
    </section>
  );
}

/**
 * Generates the speakable specification for Article schema.
 * Use this in your JsonLd component when you have SpeakableSection components on the page.
 *
 * @param sectionIds - Array of section IDs that are speakable
 * @returns SpeakableSpecification object for schema.org
 */
export function generateSpeakableSpec(sectionIds: string[]) {
  if (sectionIds.length === 0) return undefined;

  return {
    '@type': 'SpeakableSpecification',
    cssSelector: sectionIds.map((id) => `#${id}`),
  };
}

export default SpeakableSection;
