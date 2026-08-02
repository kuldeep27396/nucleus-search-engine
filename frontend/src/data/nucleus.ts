export type AclGroup = "group_all" | "group_eng" | "group_hr";

export type Persona = {
  id: "intern" | "eng_lead" | "hr_mgr" | "admin";
  label: string;
  emoji: string;
  role: string;
  email: string;
  acl: AclGroup[];
};

export const personas: Persona[] = [
  {
    id: "intern",
    label: "Intern",
    emoji: "👤",
    role: "intern",
    email: "priya.intern@acme.com",
    acl: ["group_all"],
  },
  {
    id: "eng_lead",
    label: "Eng Lead",
    emoji: "⚡",
    role: "eng_lead",
    email: "dan.kovacs@acme.com",
    acl: ["group_all", "group_eng"],
  },
  {
    id: "hr_mgr",
    label: "HR Manager",
    emoji: "🔒",
    role: "hr_mgr",
    email: "maya.hr@acme.com",
    acl: ["group_all", "group_hr"],
  },
];

export const aclLabels: Record<AclGroup, string> = {
  group_all: "🌐 Public",
  group_eng: "🔒 Eng Lead Only",
  group_hr: "🔒 HR Only",
};

export type SourceKind = "docs" | "slack" | "jira" | "code";

export type NucleusDoc = {
  id: string;
  title: string;
  kind: SourceKind;
  format: "Markdown" | "PDF" | "Drive" | "Slack" | "Jira" | "Code";
  path: string;
  snippet: string;
  highlight: string;
  score: string;
  acl: AclGroup;
};

export type AnswerSegment = { text: string } | { citation: string };

export type QueryResult = {
  id: string;
  query: string;
  latency: number;
  answer: AnswerSegment[];
  docs: NucleusDoc[];
};

export const queries: QueryResult[] = [
  {
    id: "deploy",
    query: "How do I deploy microservices in VPC?",
    latency: 142,
    answer: [
      {
        text: "Deployments into the Acme VPC run through the hardened Terraform pipeline. Push to `main`, then trigger the `vpc-deploy` workflow — it builds an OCI image, pushes to the private ECR mirror and rolls out via ArgoCD with a 20% canary window ",
      },
      { citation: "ENG-402" },
      {
        text: ". All egress stays inside the private subnet: services talk over the internal service mesh, and only the ingress gateway holds a public IP ",
      },
      { citation: "ENG-118" },
      {
        text: ". Rollbacks are a single `argocd app rollback` call and never require a new build ",
      },
      { citation: "ENG-556" },
      { text: "." },
    ],
    docs: [
      {
        id: "ENG-402",
        title: "VPC Microservice Deployment Runbook",
        kind: "docs",
        format: "Markdown",
        path: "docs/infra.md",
        snippet:
          "Trigger the vpc-deploy workflow. ArgoCD performs a 20% canary rollout inside the private subnet before promoting to 100%.",
        highlight: "vpc-deploy workflow",
        score: "0.032",
        acl: "group_all",
      },
      {
        id: "ENG-118",
        title: "Network Topology: Private Subnets & Service Mesh",
        kind: "docs",
        format: "PDF",
        path: "architecture/network-topology.pdf",
        snippet:
          "Only the ingress gateway holds a public IP. All east-west traffic is mTLS over the internal service mesh.",
        highlight: "ingress gateway",
        score: "0.029",
        acl: "group_all",
      },
      {
        id: "ENG-556",
        title: "#eng-platform — rollback thread",
        kind: "slack",
        format: "Slack",
        path: "slack/#eng-platform",
        snippet:
          "argocd app rollback nucleus-api --revision 42 — takes ~40s, no rebuild needed. Pinned by @dan.",
        highlight: "argocd app rollback",
        score: "0.024",
        acl: "group_eng",
      },
      {
        id: "ENG-771",
        title: "PLAT-2291: Harden VPC egress rules",
        kind: "jira",
        format: "Jira",
        path: "jira/PLAT-2291",
        snippet:
          "Restrict NAT gateway egress to the allowlisted registry CIDRs before the Q3 SOC2 window.",
        highlight: "NAT gateway egress",
        score: "0.021",
        acl: "group_eng",
      },
    ],
  },
  {
    id: "hr",
    query: "What is the Q3 HR Compensation policy?",
    latency: 168,
    answer: [
      {
        text: "Q3 compensation reviews run on a banded merit matrix: performance rating maps to a fixed increase band, capped at 14% outside of promotion cases ",
      },
      { citation: "HR-901" },
      {
        text: ". Equity refreshes vest on the standard 4-year schedule with a 1-year cliff, and off-cycle adjustments require VP People approval ",
      },
      { citation: "HR-455" },
      { text: "." },
    ],
    docs: [
      {
        id: "HR-901",
        title: "Q3 Compensation & Merit Matrix",
        kind: "docs",
        format: "PDF",
        path: "hr/comp-q3.pdf",
        snippet:
          "Exceeds = 8–14% band. Meets = 3–6% band. Off-cycle adjustments require VP People sign-off.",
        highlight: "merit matrix",
        score: "0.041",
        acl: "group_hr",
      },
      {
        id: "HR-455",
        title: "Equity Refresh Guidelines FY26",
        kind: "docs",
        format: "Drive",
        path: "drive/People/equity-refresh.gdoc",
        snippet:
          "Refresh grants vest over 4 years with a 1-year cliff. Bands are recalculated each fiscal half.",
        highlight: "1-year cliff",
        score: "0.036",
        acl: "group_hr",
      },
      {
        id: "HR-102",
        title: "Employee Handbook — Benefits Overview",
        kind: "docs",
        format: "Markdown",
        path: "docs/handbook.md",
        snippet:
          "All full-time staff receive the standard benefits package regardless of level or region.",
        highlight: "benefits package",
        score: "0.018",
        acl: "group_all",
      },
    ],
  },
  {
    id: "auth",
    query: "Fix database auth timeout error ERR_AUTH_4092",
    latency: 121,
    answer: [
      {
        text: "`ERR_AUTH_4092` is raised when the pooled Postgres connection outlives the IAM token TTL (15 min). Enable token pre-refresh in the connection factory and lower `pool.maxLifetime` to 10 minutes ",
      },
      { citation: "ENG-889" },
      {
        text: ". If it only fires under load, the pgbouncer prepared-statement cache is the usual culprit — switch that pool to transaction mode ",
      },
      { citation: "ENG-903" },
      { text: "." },
    ],
    docs: [
      {
        id: "ENG-889",
        title: "Troubleshooting Postgres IAM Auth Timeouts",
        kind: "docs",
        format: "Markdown",
        path: "docs/db-auth.md",
        snippet:
          "ERR_AUTH_4092: token TTL expired mid-session. Set pool.maxLifetime=600s and enable pre-refresh.",
        highlight: "ERR_AUTH_4092",
        score: "0.038",
        acl: "group_all",
      },
      {
        id: "ENG-903",
        title: "pgbouncer transaction mode migration",
        kind: "code",
        format: "Code",
        path: "services/db/pool.ts",
        snippet:
          "poolMode: 'transaction' // prepared statement cache breaks session pooling under load",
        highlight: "poolMode: 'transaction'",
        score: "0.031",
        acl: "group_eng",
      },
      {
        id: "ENG-914",
        title: "DB-1180: Recurring auth timeouts in eu-west-1",
        kind: "jira",
        format: "Jira",
        path: "jira/DB-1180",
        snippet:
          "Spike every 15 minutes correlates exactly with IAM token expiry. Fix shipped in 4.2.1.",
        highlight: "IAM token expiry",
        score: "0.027",
        acl: "group_eng",
      },
    ],
  },
];

export const sourceFilters: { id: SourceKind | "all"; label: string }[] = [
  { id: "all", label: "All Sources" },
  { id: "docs", label: "📁 Internal Docs" },
  { id: "slack", label: "💬 Slack Channels" },
  { id: "jira", label: "🎟️ Jira Tickets" },
  { id: "code", label: "💻 Code Repos" },
];

export type AuditRow = {
  id: string;
  timestamp: string;
  email: string;
  role: string;
  query: string;
  docIds: string[];
  rlsFilter: string;
  latency: number;
};

export const seedAuditRows: AuditRow[] = [
  {
    id: "a1",
    timestamp: "2026-08-02 11:58:04Z",
    email: "dan.kovacs@acme.com",
    role: "eng_lead",
    query: "kubernetes node autoscaling limits",
    docIds: ["ENG-402", "ENG-771"],
    rlsFilter: "acl_group IN (group_all, group_eng)",
    latency: 134,
  },
  {
    id: "a2",
    timestamp: "2026-08-02 11:41:22Z",
    email: "maya.hr@acme.com",
    role: "hr_mgr",
    query: "parental leave carryover",
    docIds: ["HR-102", "HR-455"],
    rlsFilter: "acl_group IN (group_all, group_hr)",
    latency: 155,
  },
  {
    id: "a3",
    timestamp: "2026-08-02 11:12:59Z",
    email: "priya.intern@acme.com",
    role: "intern",
    query: "compensation bands",
    docIds: [],
    rlsFilter: "acl_group IN (group_all)",
    latency: 98,
  },
];

export function resolveQuery(input: string): QueryResult {
  const q = input.trim().toLowerCase();
  if (!q) return queries[0]!;
  const exact = queries.find((item) => item.query.toLowerCase() === q);
  if (exact) return exact;
  const score = (item: QueryResult) =>
    item.query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3 && q.includes(w)).length;
  return [...queries].sort((a, b) => score(b) - score(a))[0]!;
}
