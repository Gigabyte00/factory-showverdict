declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window !== 'undefined') {
    window.gtag?.('event', name, props);
  }
}

export function trackAffiliateClick(brand: string, placement: string) {
  trackEvent('affiliate_click', {
    event_category: 'conversion',
    brand,
    placement,
  });
}

export function trackToolUsage(toolName: string, action: string = 'calculate') {
  trackEvent('tool_usage', {
    event_category: 'engagement',
    tool: toolName,
    action,
  });
}

export function trackNewsletterSignup(placement: string) {
  trackEvent('sign_up', {
    event_category: 'conversion',
    method: 'newsletter',
    placement,
  });
}

export function trackLeadGen(type: string) {
  trackEvent('generate_lead', {
    event_category: 'conversion',
    lead_type: type,
  });
}
