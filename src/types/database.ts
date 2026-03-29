/**
 * Factory Site Template - Database Types
 *
 * These types match the Supabase schema used by Factory sites.
 * Regenerate from your Supabase project if you modify the schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          domain: string | null;
          subdomain: string | null;
          template: string | null;
          theme_config: ThemeConfig | null;
          niche: string | null;
          target_keywords: string[] | null;
          settings: SiteSettings | null;
          default_meta: DefaultMeta | null;
          is_active: boolean | null;
          setup_status: string | null;
          launched_at: string | null;
          created_at: string | null;
          updated_at: string | null;
          deployment: DeploymentConfig | null;
        };
        Insert: Partial<Database['public']['Tables']['sites']['Row']> & {
          slug: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['sites']['Row']>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          name: string;
          description: string | null;
          parent_id: string | null;
          sort_order: number | null;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']> & {
          site_id: string;
          slug: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
        Relationships: [];
      };
      offers: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          affiliate_program: string | null;
          affiliate_url: string;
          commission_type: string | null;
          commission_value: number | null;
          cookie_duration_days: number | null;
          logo_url: string | null;
          featured_image_url: string | null;
          rating: number | null;
          pros: string[] | null;
          cons: string[] | null;
          category_id: string | null;
          tags: string[] | null;
          priority: number | null;
          is_featured: boolean | null;
          is_active: boolean | null;
          click_count: number | null;
          conversion_count: number | null;
          last_checked_at: string | null;
          link_status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['offers']['Row']> & {
          site_id: string;
          name: string;
          slug: string;
          affiliate_url: string;
        };
        Update: Partial<Database['public']['Tables']['offers']['Row']>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          site_id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          content_html: string | null;
          category_id: string | null;
          tags: string[] | null;
          author_name: string | null;
          status: PostStatus | null;
          published_at: string | null;
          scheduled_for: string | null;
          meta_title: string | null;
          meta_description: string | null;
          canonical_url: string | null;
          featured_image_url: string | null;
          featured_image_alt: string | null;
          schema_type: string | null;
          schema_data: Json | null;
          freshness_score: number | null;
          last_refreshed_at: string | null;
          refresh_priority: number | null;
          related_offer_ids: string[] | null;
          word_count: number | null;
          reading_time_minutes: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['posts']['Row']> & {
          site_id: string;
          title: string;
          slug: string;
          content: string;
        };
        Update: Partial<Database['public']['Tables']['posts']['Row']>;
        Relationships: [];
      };
      // ================================================================
      // pSEO Tables - Comparison, Use-Case, and Price Tier Pages
      // ================================================================
      comparisons: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          title: string;
          product_a_offer_id: string | null;
          product_b_offer_id: string | null;
          product_a_name: string;
          product_b_name: string;
          winner: 'a' | 'b' | 'tie' | null;
          comparison_data: Json | null;
          seo_title: string | null;
          seo_description: string | null;
          content: string | null;
          status: PseoStatus | null;
          published_at: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['comparisons']['Row']> & {
          site_id: string;
          slug: string;
          title: string;
          product_a_name: string;
          product_b_name: string;
        };
        Update: Partial<Database['public']['Tables']['comparisons']['Row']>;
        Relationships: [];
      };
      use_cases: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          title: string;
          use_case_name: string;
          category_id: string | null;
          recommended_offer_ids: string[] | null;
          criteria: string[] | null;
          content: string | null;
          seo_title: string | null;
          seo_description: string | null;
          status: PseoStatus | null;
          published_at: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['use_cases']['Row']> & {
          site_id: string;
          slug: string;
          title: string;
          use_case_name: string;
        };
        Update: Partial<Database['public']['Tables']['use_cases']['Row']>;
        Relationships: [];
      };
      price_tiers: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          title: string;
          category_id: string | null;
          max_price: number;
          price_label: string;
          offer_ids: string[] | null;
          content: string | null;
          seo_title: string | null;
          seo_description: string | null;
          status: PseoStatus | null;
          published_at: string | null;
          updated_at: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['price_tiers']['Row']> & {
          site_id: string;
          slug: string;
          title: string;
          max_price: number;
          price_label: string;
        };
        Update: Partial<Database['public']['Tables']['price_tiers']['Row']>;
        Relationships: [];
      };
      // ================================================================
      // Interactive Tools Tables - Calculators & Quizzes
      // ================================================================
      calculator_templates: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          name: string;
          description: string | null;
          calculator_type: string;
          input_fields: Json;
          calculation_formula: Json;
          result_template: string;
          meta_title: string | null;
          meta_description: string | null;
          target_keyword: string | null;
          cta_text: string | null;
          cta_url: string | null;
          show_email_capture: boolean;
          usage_count: number;
          conversion_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['calculator_templates']['Row']> & {
          site_id: string;
          slug: string;
          name: string;
          calculator_type: string;
          input_fields: Json;
          calculation_formula: Json;
          result_template: string;
        };
        Update: Partial<Database['public']['Tables']['calculator_templates']['Row']>;
        Relationships: [];
      };
      quiz_templates: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          name: string;
          description: string | null;
          quiz_type: string;
          result_calculation: string | null;
          meta_title: string | null;
          meta_description: string | null;
          target_keyword: string | null;
          cta_text: string | null;
          cta_url: string | null;
          show_email_capture: boolean;
          start_count: number;
          completion_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['quiz_templates']['Row']> & {
          site_id: string;
          slug: string;
          name: string;
          quiz_type: string;
        };
        Update: Partial<Database['public']['Tables']['quiz_templates']['Row']>;
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          template_id: string;
          question_text: string;
          question_type: string;
          options: Json;
          order_index: number;
          is_required: boolean;
          help_text: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['quiz_questions']['Row']> & {
          template_id: string;
          question_text: string;
          question_type: string;
          options: Json;
          order_index: number;
        };
        Update: Partial<Database['public']['Tables']['quiz_questions']['Row']>;
        Relationships: [];
      };
      quiz_results: {
        Row: {
          id: string;
          template_id: string;
          result_key: string;
          title: string;
          description: string | null;
          min_score: number | null;
          max_score: number | null;
          required_tags: string[] | null;
          recommended_offers: string[] | null;
          recommended_posts: string[] | null;
          image_url: string | null;
          cta_text: string | null;
          cta_url: string | null;
          priority: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['quiz_results']['Row']> & {
          template_id: string;
          result_key: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['quiz_results']['Row']>;
        Relationships: [];
      };
      // ================================================================
      // Lead Gen & Tracking Tables
      // ================================================================
      newsletter_subscribers: {
        Row: {
          id: string;
          site_id: string;
          email: string;
          status: string;
          source: string | null;
          subscribed_at: string;
          unsubscribed_at: string | null;
          convertkit_subscriber_id: string | null;
          metadata: Json;
          drip_step: number;
          drip_sent_at: string | null;
          name: string | null;
        };
        Insert: {
          id?: string;
          site_id: string;
          email: string;
          status?: string;
          source?: string | null;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          convertkit_subscriber_id?: string | null;
          metadata?: Json;
          drip_step?: number;
          drip_sent_at?: string | null;
          name?: string | null;
        };
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Row']>;
        Relationships: [];
      };
      offer_clicks: {
        Row: {
          id: string;
          offer_id: string;
          site_id: string;
          deal_id: string | null;
          referrer: string | null;
          user_agent: string | null;
          ip_hash: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          clicked_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          site_id: string;
          deal_id?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          ip_hash?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          clicked_at?: string;
        };
        Update: Partial<Database['public']['Tables']['offer_clicks']['Row']>;
        Relationships: [];
      };
      authors: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          slug: string;
          bio: string | null;
          credentials: string | null;
          expertise: string[] | null;
          avatar_url: string | null;
          social_links: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          name: string;
          slug: string;
          bio?: string | null;
          credentials?: string | null;
          expertise?: string[] | null;
          avatar_url?: string | null;
          social_links?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['authors']['Row']>;
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['contact_submissions']['Row']>;
        Relationships: [];
      };
      // ================================================================
      // Knowledge Base Tables (AEO / Topic Authority)
      // ================================================================
      faq_items: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          question: string;
          answer: string;
          answer_html: string | null;
          category_id: string | null;
          topic_cluster_id: string | null;
          source: string | null;
          schema_data: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          slug: string;
          question: string;
          answer: string;
          answer_html?: string | null;
          category_id?: string | null;
          topic_cluster_id?: string | null;
          source?: string | null;
          schema_data?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['faq_items']['Row']>;
        Relationships: [];
      };
      glossary_terms: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          term: string;
          definition: string;
          definition_html: string | null;
          related_terms: string[] | null;
          related_post_ids: string[] | null;
          category: string | null;
          schema_data: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          slug: string;
          term: string;
          definition: string;
          definition_html?: string | null;
          related_terms?: string[] | null;
          related_post_ids?: string[] | null;
          category?: string | null;
          schema_data?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['glossary_terms']['Row']>;
        Relationships: [];
      };
      topic_clusters: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          name: string;
          description: string | null;
          content: string | null;
          content_html: string | null;
          related_post_ids: string[] | null;
          related_faq_ids: string[] | null;
          related_term_ids: string[] | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          slug: string;
          name: string;
          description?: string | null;
          content?: string | null;
          content_html?: string | null;
          related_post_ids?: string[] | null;
          related_faq_ids?: string[] | null;
          related_term_ids?: string[] | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['topic_clusters']['Row']>;
        Relationships: [];
      };
      web_stories: {
        Row: {
          id: string;
          site_id: string | null;
          post_id: string | null;
          slug: string;
          title: string;
          poster_image_url: string | null;
          slides: Json;
          status: string | null;
          impressions: number | null;
          clicks: number | null;
          published_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          site_id?: string | null;
          post_id?: string | null;
          slug: string;
          title: string;
          poster_image_url?: string | null;
          slides?: Json;
          status?: string | null;
          impressions?: number | null;
          clicks?: number | null;
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['web_stories']['Row']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

// ============================================================================
// Custom Types (JSONB column types)
// ============================================================================

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
}

export interface SiteSettings {
  footerText: string | null;
  socialLinks: Record<string, string>;
  plausibleDomain: string | null;
  site_type?: 'affiliate' | 'blog' | 'landing' | 'ecommerce';
  features?: {
    blog?: boolean;
    offers?: boolean;
    newsletter?: boolean;
  };
  // Template variant overrides (auto-detected if not set)
  blogListVariant?: string;
  postDetailVariant?: string;
  offersVariant?: string;
  categoryVariant?: string;
}

export interface DefaultMeta {
  titleSuffix: string | null;
  defaultDescription: string | null;
  ogImage: string | null;
}

export interface DeploymentConfig {
  platform?: 'vercel';
  project_id?: string;
  domain_verified?: boolean;
  domain_added_at?: string;
  last_deployed_at?: string;
}

// ============================================================================
// Enums
// ============================================================================

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type PseoStatus = 'draft' | 'published' | 'archived';
export type WebStoryStatus = 'draft' | 'published' | 'archived';

// ============================================================================
// Web Stories Types
// ============================================================================

export interface WebStorySlide {
  id: string;
  image: string;
  imageAlt?: string;
  text?: string;
  textPosition?: 'top' | 'center' | 'bottom';
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface WebStory {
  id: string;
  site_id: string;
  post_id: string | null;
  slug: string;
  title: string;
  poster_image_url: string | null;
  slides: WebStorySlide[];
  status: WebStoryStatus;
  impressions: number;
  clicks: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Interactive Tools Types (Calculators & Quizzes)
// ============================================================================

export interface CalculatorInputField {
  name: string;
  label: string;
  type: 'number' | 'select' | 'range';
  unit?: string;
  default_value: number;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

export interface CalculatorTemplate {
  id: string;
  site_id: string;
  slug: string;
  name: string;
  description: string | null;
  calculator_type: string;
  input_fields: CalculatorInputField[];
  calculation_formula: Record<string, string>;
  result_template: string;
  meta_title: string | null;
  meta_description: string | null;
  target_keyword: string | null;
  cta_text: string | null;
  cta_url: string | null;
  show_email_capture: boolean;
  usage_count: number;
  conversion_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizOption {
  value: string;
  label: string;
  image_url?: string;
  score?: number;
  tags?: string[];
}

export interface QuizQuestion {
  id: string;
  template_id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'range' | 'budget';
  options: QuizOption[];
  order_index: number;
  is_required: boolean;
  help_text?: string;
  created_at: string;
}

export interface QuizResult {
  id: string;
  quiz_id: string;
  result_key: string;
  title: string;
  description: string | null;
  min_score: number | null;
  max_score: number | null;
  required_tags: string[] | null;
  recommended_offers: string[] | null;
  recommended_posts: string[] | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  priority: number;
  created_at: string;
}

export interface QuizTemplate {
  id: string;
  site_id: string;
  slug: string;
  name: string;
  description: string | null;
  quiz_type: 'recommendation' | 'assessment' | 'personality';
  result_calculation: string | null;
  meta_title: string | null;
  meta_description: string | null;
  target_keyword: string | null;
  cta_text: string | null;
  cta_url: string | null;
  show_email_capture: boolean;
  start_count: number;
  completion_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Convenience Types
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

// Row types for easy access
export type Site = Tables<'sites'>;
export type Category = Tables<'categories'>;
export type Offer = Tables<'offers'>;
export type Post = Tables<'posts'>;

// pSEO row types
export type Comparison = Tables<'comparisons'>;
export type UseCase = Tables<'use_cases'>;
export type PriceTier = Tables<'price_tiers'>;

// Lead gen & tracking
export type NewsletterSubscriber = Tables<'newsletter_subscribers'>;
export type OfferClick = Tables<'offer_clicks'>;
export type Author = Tables<'authors'>;
export type ContactSubmission = Tables<'contact_submissions'>;

// Knowledge base
export type FaqItem = Tables<'faq_items'>;
export type GlossaryTerm = Tables<'glossary_terms'>;
export type TopicCluster = Tables<'topic_clusters'>;
export type WebStoryRow = Tables<'web_stories'>;
