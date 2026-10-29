import INSIGHT_ART from "@salesforce/resourceUrl/pcInsightArt";
import CONTACT_AVATAR from "@salesforce/resourceUrl/pcContactAvatar";
import { articleHref } from "c/pcNav";

/**
 * Static v1 article content for the Partner Cloud Insights blog.
 * Per the content map's data-flow note this is intentionally hardcoded until a
 * Partner-Cloud-specific data layer exists. Do not import Contentful services.
 */

export const ARTICLE_TAGS = Object.freeze([
  "Strategy",
  "Data",
  "Engagement",
  "Enablement",
  "Programs"
]);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const AUTHORS = {
  jake: {
    name: "Jake Seibert",
    initials: "JS",
    role: "Senior Principal, Salesforce Partner Cloud",
    shortRole: "Senior Principal, Partner Cloud",
    avatarUrl: CONTACT_AVATAR,
    email: "jake.seibert@slalom.com",
    bio: "Jake leads Slalom's Salesforce Partner Cloud practice, helping organizations turn partner strategy into partner behavior across channel, marketing, and enablement."
  },
  riya: {
    name: "Riya Shah",
    initials: "RS",
    role: "Principal, Data & Analytics",
    shortRole: "Principal, Data & Analytics",
    bio: "Riya helps channel and finance leaders connect deal, incentive, and attribution data into a single, forecastable view of partner program performance."
  },
  marcus: {
    name: "Marcus Cole",
    initials: "MC",
    role: "Director, Partner Experience",
    shortRole: "Director, Partner Experience",
    bio: "Marcus designs partner experiences that keep partners on-platform — from rules of engagement to real-time collaboration in Slack."
  },
  ava: {
    name: "Ava Lindqvist",
    initials: "AL",
    role: "Senior Consultant, Partner Programs",
    shortRole: "Senior Consultant, Partner Programs",
    bio: "Ava builds tiering, incentive, and directory programs that make partner progress visible and reward the behaviors that grow the ecosystem."
  }
};

const ARTICLES = [
  {
    slug: "designing-partner-journeys",
    title: "Designing partner journeys that actually convert",
    crumb: "Partner journeys",
    excerpt:
      "Why the first 30 days of onboarding decide the next 30 months of program value.",
    deck: "Why the first 30 days of onboarding decide the next 30 months of program value — and the journey map we use to get it right.",
    tag: "Strategy",
    date: "2026-08-12",
    readMinutes: 6,
    author: "jake",
    image: "journeys.svg",
    imageAlt:
      "Illustration of a partner journey path with milestones from registration to growth",
    featured: true,
    body: [
      {
        type: "lead",
        text: "A thriving partner ecosystem boosts adoption, scale, and innovation. But the impact hinges on something deceptively simple: whether a partner's first experiences feel effortless. The journeys you design in the first 30 days quietly set the ceiling for the next 30 months."
      },
      {
        type: "p",
        text: "Most programs treat onboarding as a checklist — provision access, share a deck, assign a rep. Partners treat it as a signal. If registering a deal is painful, if enablement is buried, if nobody notices their first win, they conclude the program isn't built for them. And they route around it."
      },
      {
        type: "h2",
        text: "Start from the partner's job, not your org chart"
      },
      {
        type: "p",
        text: 'The most common failure mode is designing journeys around internal teams instead of the outcomes a partner is trying to reach. A partner doesn\'t want to "complete onboarding" — they want to close their first deal, get paid accurately, and know where they stand. Map to those outcomes and the friction points become obvious.'
      },
      {
        type: "quote",
        text: "Partners don't remember your portal. They remember whether their first deal was easy — and whether anyone noticed when they won it."
      },
      { type: "h2", text: "The 30-60-90 that shortens time-to-first-deal" },
      {
        type: "p",
        text: "We anchor every partner journey to three moments of proof. Each one is designed to remove a specific reason a partner might disengage."
      },
      {
        type: "callout",
        title: "Key takeaways",
        items: [
          {
            label: "Days 0–30:",
            text: "One-click deal registration and a guided first win — remove pipeline friction immediately."
          },
          {
            label: "Days 31–60:",
            text: "Contextual enablement surfaced inside the flow of work, not in a separate LMS."
          },
          {
            label: "Days 61–90:",
            text: "Visible tiering progress and recognition so early momentum compounds into loyalty."
          }
        ]
      },
      { type: "h2", text: "Make progress visible" },
      {
        type: "p",
        text: "Recognition is the cheapest retention lever most programs ignore. When partners can see their tier progress, rewards, and standing without asking, loyalty stops being a mystery and starts being a scoreboard. That visibility is what turns a one-time producer into a durable channel."
      },
      {
        type: "figure",
        image: "journey-map.svg",
        alt: "Partner journey map with three stages: register, enable, and progress",
        caption:
          "A partner journey mapped to outcomes — register, enable, progress — rather than internal handoffs."
      },
      { type: "h2", text: "Where to start" },
      {
        type: "p",
        text: "You don't need to rebuild the whole program to feel the impact. Pick the single most painful step in a partner's first 30 days — usually deal registration — and remove the friction there first. Measure time-to-first-deal before and after. The rest of the journey becomes far easier to justify once that number moves."
      }
    ]
  },
  {
    slug: "proving-partner-roi",
    title: "Proving partner ROI with a 360° revenue view",
    crumb: "Partner ROI",
    excerpt:
      "Connecting deal insights, incentives, and attribution into one forecastable picture.",
    deck: "Connecting deal insights, incentive forecasting, and marketing attribution into one forecastable picture of investment and expected revenue.",
    tag: "Data",
    date: "2026-07-28",
    readMinutes: 5,
    author: "riya",
    image: "roi.svg",
    imageAlt:
      "Illustration of a 360-degree revenue ring beside a rising bar chart",
    body: [
      {
        type: "lead",
        text: "Every partner leader eventually gets the same question from finance: what are we actually getting for this program? Too often the honest answer lives in four disconnected systems — deal registration, incentive payouts, MDF claims, and marketing attribution."
      },
      { type: "h2", text: "Stop reporting activity. Start reporting return." },
      {
        type: "p",
        text: "Registrations and enablement completions are useful leading indicators, but they don't answer the ROI question. A 360° view pairs what you invest in each partner — incentives, MDF, enablement hours — with the pipeline and revenue that investment produces."
      },
      {
        type: "quote",
        text: "If you can't see investment and expected revenue on the same page, you're not managing a program — you're funding one."
      },
      { type: "h2", text: "Three data joins that change the conversation" },
      {
        type: "callout",
        title: "What to connect",
        items: [
          {
            label: "Deals → incentives:",
            text: "Tie every rebate and SPIF to the registered opportunity it rewarded."
          },
          {
            label: "Campaigns → pipeline:",
            text: "Attribute MDF-funded campaigns to sourced and influenced opportunities."
          },
          {
            label: "Forecast → payouts:",
            text: "Project incentive liability alongside expected bookings so finance sees both sides."
          }
        ]
      },
      { type: "h2", text: "Start with one partner tier" },
      {
        type: "p",
        text: "You don't need a perfect data model on day one. Pick your top tier, connect deals to incentives for that cohort, and publish a simple return-on-investment view each quarter. Credibility compounds faster than completeness."
      }
    ]
  },
  {
    slug: "slack-and-salesforce",
    title: "Meeting partners where they work: Slack + Salesforce",
    crumb: "Slack + Salesforce",
    excerpt:
      "Real-time engagement patterns that keep partners on-platform and moving deals.",
    deck: "Real-time engagement patterns that keep partners on-platform, informed, and moving deals forward.",
    tag: "Engagement",
    date: "2026-07-09",
    readMinutes: 4,
    author: "marcus",
    image: "slack.svg",
    imageAlt:
      "Illustration of a collaboration channel with real-time deal approval messages",
    body: [
      {
        type: "lead",
        text: "Partners don't live in your portal. They live in their inbox, their CRM, and increasingly in Slack. Programs that insist on pulling partners into yet another destination lose the moments that matter most."
      },
      { type: "h2", text: "Bring the program to the conversation" },
      {
        type: "p",
        text: "With Slack connected to Partner Cloud, deal approvals, lead assignments, and enablement nudges can arrive where partner reps already collaborate. The portal stays the system of record; Slack becomes the system of engagement."
      },
      {
        type: "callout",
        title: "Patterns that work",
        items: [
          {
            label: "Shared deal channels:",
            text: "Spin up a channel per strategic opportunity with the partner and your channel manager."
          },
          {
            label: "Approval alerts:",
            text: "Push registration decisions in real time so partners never wonder where a deal stands."
          },
          {
            label: "Enablement drops:",
            text: "Announce new certifications and plays in a partner-wide channel with one-click access."
          }
        ]
      },
      { type: "h2", text: "Keep marketing and messaging in sync" },
      {
        type: "p",
        text: "Real-time engagement works best when it's orchestrated with your marketing communications. Align Slack moments with campaign calendars so partners hear one coherent story — not five competing ones."
      }
    ]
  },
  {
    slug: "onboarding-to-producers",
    title: "Onboarding that turns new partners into producers",
    crumb: "Partner onboarding",
    excerpt:
      "A 30-60-90 enablement blueprint that shortens time-to-first-deal.",
    deck: "A 30-60-90 enablement blueprint that shortens time-to-first-deal and turns early enthusiasm into durable production.",
    tag: "Enablement",
    date: "2026-06-22",
    readMinutes: 7,
    author: "jake",
    image: "onboarding.svg",
    imageAlt:
      "Illustration of ascending 30, 60, and 90 day steps toward a goal flag",
    body: [
      {
        type: "lead",
        text: "New partners arrive with enthusiasm and a short attention span. If the path to a first deal isn't obvious within weeks, that enthusiasm quietly turns into indifference."
      },
      { type: "h2", text: "Design for time-to-first-deal" },
      {
        type: "p",
        text: "The most predictive metric for long-term partner productivity is how quickly a partner closes their first opportunity. Every onboarding step should be judged by whether it shortens that clock."
      },
      {
        type: "figure",
        image: "journey-map.svg",
        alt: "Onboarding blueprint with register, enable, and progress stages",
        caption:
          "A 30-60-90 blueprint: register, enable, and progress — each stage with one clear outcome."
      },
      { type: "h2", text: "The 30-60-90 blueprint" },
      {
        type: "callout",
        title: "Blueprint",
        items: [
          {
            label: "Days 0–30:",
            text: "Activate accounts, assign a partner manager, and register a first deal with guided help."
          },
          {
            label: "Days 31–60:",
            text: "Deliver role-based enablement inside the portal, tied to the deals partners are working."
          },
          {
            label: "Days 61–90:",
            text: "Celebrate the first win, surface tier progress, and introduce co-marketing benefits."
          }
        ]
      },
      {
        type: "p",
        text: "Treat the blueprint as a product, not a project: instrument each step, watch where partners stall, and iterate monthly."
      }
    ]
  },
  {
    slug: "tiering-partners-understand",
    title: "Tiering that partners actually understand",
    crumb: "Partner tiering",
    excerpt:
      "Making progress and rewards visible so loyalty compounds instead of stalling.",
    deck: "Making tier progress and rewards visible so loyalty compounds instead of stalling.",
    tag: "Programs",
    date: "2026-06-03",
    readMinutes: 5,
    author: "ava",
    image: "tiering.svg",
    imageAlt:
      "Illustration of three tier medallions with a progress bar toward the top tier",
    body: [
      {
        type: "lead",
        text: "Tier programs are supposed to motivate. In practice, many partners couldn't tell you which tier they're in, what it takes to move up, or what they'd get when they do."
      },
      { type: "h2", text: "Visibility is the incentive" },
      {
        type: "p",
        text: "When progress is hidden, rewards feel arbitrary and loyalty weakens. Surfacing tier status, thresholds, and benefits directly on the partner home page turns an annual surprise into a daily motivator."
      },
      {
        type: "quote",
        text: "A tier nobody can see is just a spreadsheet. A tier partners can track is a growth engine."
      },
      { type: "h2", text: "What a great tier experience shows" },
      {
        type: "callout",
        title: "Show partners",
        items: [
          {
            label: "Where they stand:",
            text: "Current tier, points or revenue to date, and the date of the next review."
          },
          {
            label: "What's next:",
            text: "The specific gaps to the next tier, translated into concrete actions."
          },
          {
            label: "Why it matters:",
            text: "Benefits unlocked at each level — from MDF eligibility to lead-routing priority."
          }
        ]
      }
    ]
  },
  {
    slug: "resolving-channel-conflict",
    title: "Resolving channel conflict before it erodes trust",
    crumb: "Channel conflict",
    excerpt:
      "A rules-of-engagement framework that keeps direct and partner motions aligned.",
    deck: "A rules-of-engagement framework that keeps direct and partner motions aligned — and keeps partners investing.",
    tag: "Strategy",
    date: "2026-05-19",
    readMinutes: 6,
    author: "marcus",
    image: "conflict.svg",
    imageAlt:
      "Illustration of direct and partner sales lanes merging through a protective shield",
    body: [
      {
        type: "lead",
        text: "Nothing erodes partner trust faster than losing a deal to your own direct sales team. Channel conflict is rarely malicious — it's usually the product of ambiguous rules and invisible data."
      },
      { type: "h2", text: "Make the rules of engagement explicit" },
      {
        type: "p",
        text: "Partners need to know, before they invest, how deal ownership is decided. Publish clear criteria for registration acceptance, exclusivity windows, and how overlap with direct reps is resolved."
      },
      {
        type: "callout",
        title: "A simple framework",
        items: [
          {
            label: "First to register, first protected:",
            text: "Time-stamped registrations with a defined protection window."
          },
          {
            label: "Transparent overlap checks:",
            text: "Automated duplicate detection against open direct opportunities."
          },
          {
            label: "Fair compensation:",
            text: "Neutral or shared compensation models so direct reps welcome partner involvement."
          }
        ]
      },
      { type: "h2", text: "Let the platform enforce it" },
      {
        type: "p",
        text: "Codify your rules in Partner Cloud — duplicate matching, approval routing, and status notifications — so decisions are consistent and partners see the outcome in real time."
      }
    ]
  },
  {
    slug: "forecasting-incentive-spend",
    title: "Forecasting incentive spend with confidence",
    crumb: "Incentive forecasting",
    excerpt:
      "Modeling MDF and rebates alongside pipeline for a true cost-of-program view.",
    deck: "Modeling MDF and rebates alongside pipeline for a true cost-of-program view — before the invoices arrive.",
    tag: "Data",
    date: "2026-05-02",
    readMinutes: 4,
    author: "riya",
    image: "forecast.svg",
    imageAlt:
      "Illustration of an area chart with a dashed forecast and confidence band",
    body: [
      {
        type: "lead",
        text: "Incentive budgets are often set once a year and reconciled once a quarter. In between, program leaders are flying blind on what they'll actually owe."
      },
      { type: "h2", text: "Model spend alongside pipeline" },
      {
        type: "p",
        text: "Every registered deal carries an implied incentive. By projecting rebates, SPIFs, and MDF commitments against the same pipeline your sales forecast uses, you get a true cost-of-program view before the invoices arrive."
      },
      {
        type: "callout",
        title: "Inputs to model",
        items: [
          {
            label: "Pipeline by partner:",
            text: "Stage-weighted opportunity value for each partner and tier."
          },
          {
            label: "Incentive rules:",
            text: "Rebate rates, accelerators, and caps applied per program."
          },
          {
            label: "MDF commitments:",
            text: "Approved funds, claims in flight, and historical claim rates."
          }
        ]
      },
      { type: "h2", text: "Turn the forecast into decisions" },
      {
        type: "p",
        text: "With spend visible early, you can shift funds toward the partners and plays generating the highest return — instead of discovering the overrun at quarter end."
      }
    ]
  },
  {
    slug: "directory-as-deal-intake",
    title: "Turning your partner directory into a deal-intake channel",
    crumb: "Partner directory",
    excerpt:
      "How directory management doubles as a lead-routing engine for best-fit partners.",
    deck: "How directory management doubles as a lead-routing engine that sends qualified work to your best-fit partners.",
    tag: "Programs",
    date: "2026-04-15",
    readMinutes: 5,
    author: "ava",
    image: "directory.svg",
    imageAlt:
      "Illustration of a searchable partner directory routing a request to a deal inbox",
    body: [
      {
        type: "lead",
        text: "Most partner directories are static lists that buyers scroll past. Managed well, the directory becomes one of your most effective deal-intake channels."
      },
      { type: "h2", text: "From listing to lead routing" },
      {
        type: "p",
        text: "When customers can search partners by industry, region, and specialty — and submit a request directly — every directory visit becomes a qualified lead routed to the right partner automatically."
      },
      {
        type: "quote",
        text: "The best partner directory doesn't just show who your partners are. It sends them work."
      },
      { type: "h2", text: "What makes it work" },
      {
        type: "callout",
        title: "Ingredients",
        items: [
          {
            label: "Rich, current profiles:",
            text: "Partners maintain their own specialties, certifications, and success stories."
          },
          {
            label: "Smart matching:",
            text: "Route inbound requests by fit, capacity, and tier."
          },
          {
            label: "Closed-loop tracking:",
            text: "Measure directory-sourced pipeline so partners see the value of keeping profiles fresh."
          }
        ]
      }
    ]
  }
];

function artUrl(fileName) {
  return `${INSIGHT_ART}/${fileName}`;
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const shortDate = `${MONTHS[month - 1]} ${String(day).padStart(2, "0")}`;
  return { shortDate, dateLabel: `${shortDate}, ${year}` };
}

function decorateBlock(block, slug, index) {
  const decorated = {
    ...block,
    key: `${slug}-block-${index}`,
    isLead: block.type === "lead",
    isParagraph: block.type === "p",
    isHeading: block.type === "h2",
    isQuote: block.type === "quote",
    isCallout: block.type === "callout",
    isFigure: block.type === "figure"
  };
  if (block.items) {
    decorated.items = block.items.map((item, itemIndex) => ({
      ...item,
      key: `${slug}-block-${index}-item-${itemIndex}`
    }));
  }
  if (block.image) {
    decorated.imageUrl = artUrl(block.image);
  }
  return decorated;
}

function decorateArticle(article) {
  const author = { ...AUTHORS[article.author] };
  author.hasAvatar = Boolean(author.avatarUrl);
  author.hasEmail = Boolean(author.email);
  author.mailto = author.email ? `mailto:${author.email}` : null;
  const { shortDate, dateLabel } = formatDate(article.date);
  return {
    ...article,
    featured: Boolean(article.featured),
    author,
    shortDate,
    dateLabel,
    readLabel: `${article.readMinutes} min read`,
    metaShort: `${shortDate} · ${article.readMinutes} min`,
    metaLong: `${dateLabel} · ${article.readMinutes} min read`,
    imageUrl: artUrl(article.image),
    href: articleHref(article.slug),
    body: article.body.map((block, index) =>
      decorateBlock(block, article.slug, index)
    )
  };
}

/** All articles, newest first. Returns fresh copies safe for component state. */
export function getArticles() {
  return ARTICLES.map(decorateArticle).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export function getLatestArticles(count = 3) {
  return getArticles().slice(0, count);
}

export function getFeaturedArticle() {
  const articles = getArticles();
  return articles.find((article) => article.featured) || articles[0];
}

export function getArticleBySlug(slug) {
  return getArticles().find((article) => article.slug === slug) || null;
}

/** Same-tag articles first, then the most recent others. */
export function getRelatedArticles(slug, count = 3) {
  const current = getArticleBySlug(slug);
  const others = getArticles().filter((article) => article.slug !== slug);
  if (!current) {
    return others.slice(0, count);
  }
  const sameTag = others.filter((article) => article.tag === current.tag);
  const rest = others.filter((article) => article.tag !== current.tag);
  return [...sameTag, ...rest].slice(0, count);
}
