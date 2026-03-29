import {
  Bike,
  Mountain,
  Briefcase,
  Minimize2,
  Wrench,
  ClipboardCheck,
  Star,
  Scale,
  ShoppingCart,
  Tag,
  Folder,
  Zap,
  Battery,
  Settings,
  BookOpen,
  TrendingUp,
  Award,
  DollarSign,
  Package,
  Truck,
  Heart,
  Shield,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps category slugs to Lucide icons
 *
 * Coverage:
 * - eBike niches (mountain, commuter, folding, accessories)
 * - General affiliate (reviews, comparisons, guides, deals)
 * - Finance (savings, investing, credit)
 * - Tech (gadgets, software)
 * - Fallback for unknown categories
 */
const categoryIcons: Record<string, LucideIcon> = {
  // eBikes specific
  'electric-mountain-bikes': Mountain,
  'mountain-bikes': Mountain,
  'commuter-ebikes': Briefcase,
  'commuter': Briefcase,
  'city-bikes': Briefcase,
  'folding-electric-bikes': Minimize2,
  'folding-bikes': Minimize2,
  'folding': Minimize2,
  'ebike-accessories': Wrench,
  'accessories': Wrench,
  'ebike-reviews': ClipboardCheck,
  'electric-bikes': Bike,
  'ebikes': Bike,
  'e-bikes': Bike,
  'bikes': Bike,

  // General affiliate
  'reviews': Star,
  'comparisons': Scale,
  'comparison': Scale,
  'vs': Scale,
  'buying-guides': ShoppingCart,
  'guides': BookOpen,
  'how-to': Lightbulb,
  'deals': Tag,
  'sales': Tag,
  'discounts': Tag,
  'best': Award,
  'top-picks': Award,
  'recommended': Award,

  // Tech
  'tech': Zap,
  'technology': Zap,
  'gadgets': Zap,
  'electronics': Zap,
  'batteries': Battery,
  'battery': Battery,
  'motors': Settings,
  'components': Settings,

  // Finance
  'finance': DollarSign,
  'money': DollarSign,
  'savings': DollarSign,
  'investing': TrendingUp,
  'credit': DollarSign,

  // Ecommerce
  'products': Package,
  'shipping': Truck,
  'delivery': Truck,

  // Lifestyle
  'health': Heart,
  'fitness': Heart,
  'wellness': Heart,
  'safety': Shield,
  'protection': Shield,
};

interface CategoryIconProps {
  slug: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Renders an icon for a category based on its slug
 *
 * Size classes:
 * - sm: w-4 h-4
 * - md: w-6 h-6 (default)
 * - lg: w-8 h-8
 */
export function CategoryIcon({ slug, className = '', size = 'md' }: CategoryIconProps) {
  // Normalize slug for matching
  const normalizedSlug = slug.toLowerCase().replace(/[_\s]/g, '-');

  // Try exact match first
  let Icon = categoryIcons[normalizedSlug];

  // If no exact match, try partial matches
  if (!Icon) {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (normalizedSlug.includes(key) || key.includes(normalizedSlug)) {
        Icon = icon;
        break;
      }
    }
  }

  // Fallback to Folder icon
  if (!Icon) {
    Icon = Folder;
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return <Icon className={`${sizeClasses[size]} ${className}`} />;
}

/**
 * Get the icon component for a category (for use outside React rendering)
 */
export function getCategoryIcon(slug: string): LucideIcon {
  const normalizedSlug = slug.toLowerCase().replace(/[_\s]/g, '-');

  let Icon = categoryIcons[normalizedSlug];

  if (!Icon) {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (normalizedSlug.includes(key) || key.includes(normalizedSlug)) {
        Icon = icon;
        break;
      }
    }
  }

  return Icon || Folder;
}
