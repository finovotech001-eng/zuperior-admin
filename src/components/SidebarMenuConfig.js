import {
  LayoutDashboard, Users, ShieldCheck, Settings, ServerCog, PlugZap, Database, Building2, Mail,
  Boxes, FolderKanban, LineChart, BarChart3, Calculator, FileText, ClipboardList,
  KeySquare, UserCog, Banknote, IndianRupee, Newspaper, Signal, Link,
  GitBranch, Network, Copy, Layers, ListChecks, Wallet, CreditCard, QrCode, Activity, Terminal, Headphones
} from "lucide-react";

/* -------------------- SUPER ADMIN -------------------- */
export const SUPERADMIN_MENU = [
  {
    label: "OVERVIEW",
    items: [{ icon: LayoutDashboard, label: "Dashboard", to: "/sa/dashboard" }],
  },
  {
    label: "ADMINS & TENANTS",
    items: [
      { icon: Users, label: "Manage Admins", to: "/sa/admins" },
      { icon: Building2, label: "Assign Tenants", to: "/sa/tenants" },
      { icon: ShieldCheck, label: "Global Roles", to: "/sa/roles" },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { icon: Settings, label: "Platform Settings", to: "/sa/settings" },
      { icon: PlugZap, label: "Integrations", to: "/sa/integrations" },
      { icon: Database, label: "Storage", to: "/sa/storage" },
      { icon: ServerCog, label: "MT5 Connections", to: "/sa/mt5-connections" },
    ],
  },
  {
    label: "COMPLIANCE & BILLING",
    items: [
      { icon: Mail, label: "KYC Providers", to: "/sa/kyc-providers" },
      { icon: Settings, label: "Billing", to: "/sa/billing" },
      { icon: Settings, label: "Audit Logs", to: "/sa/audit-logs" },
    ],
  },
];

/* -------------------- ADMIN -------------------- */
export const ADMIN_MENU = [
  {
    label: "ADMIN PANEL",
    items: [{ icon: LineChart, label: "Dashboard", to: "/admin/dashboard" }],
  },
  {
    label: "CLIENTS & ACCESS",
    items: [
      {
        icon: Users,
        label: "Manage Users",
        to: "/admin/users",
        children: [
          { label: "Add User", to: "/admin/users/add" },
          { label: "All Users", to: "/admin/users/all" },
          { label: "Active Users", to: "/admin/users/active" },
          { label: "Banned Users", to: "/admin/users/banned" },
          { label: "Email Unverified", to: "/admin/users/email-unverified" },
          { label: "With Balance", to: "/admin/users/with-balance" },
        ],
      },
      { icon: ShieldCheck, label: "KYC Verifications", to: "/admin/kyc" },
      { icon: Users, label: "Manage MT5 Groups", to: "/admin/add-group" },
      { icon: KeySquare, label: "Activity / Login Logs", to: "/admin/activity-logs" },
    ],
  },
  {
    label: "MT5 MANAGEMENT",
    items: [
      {
        icon: LayoutDashboard,
        label: "MT5 Management",
        to: "/admin/mt5",
        children: [
          { label: "MT5 Users List", to: "/admin/mt5/users" },
          { label: "Assign MT5 to Email", to: "/admin/mt5/assign" },
        ],
      },
    ],
  },
  {
    label: "FINANCE & OPS",
    items: [
      {
        icon: Calculator,
        label: "Manage Deposits",
        to: "/admin/deposits",
        children: [
          { label: "Pending Deposits", to: "/admin/deposits/pending" },
          { label: "Approved Deposits", to: "/admin/deposits/approved" },
          { label: "Rejected Deposits", to: "/admin/deposits/rejected" },
          { label: "All Deposits", to: "/admin/deposits/all" },
        ],
      },
      {
        icon: Calculator,
        label: "Manage Withdrawals",
        to: "/admin/withdrawals",
        children: [
          { label: "Pending Withdrawals", to: "/admin/withdrawals/pending" },
          { label: "Approved Withdrawals", to: "/admin/withdrawals/approved" },
          { label: "Rejected Withdrawals", to: "/admin/withdrawals/rejected" },
          { label: "All Withdrawals", to: "/admin/withdrawals/all" },
        ],
      },
      {
        icon: CreditCard,
        label: "Payment Gateways",
        to: "/admin/payment-gateways",
        children: [
          { label: "Automatic Gateways", to: "/admin/payment-gateways/automatic" },
          { label: "Manual Gateways", to: "/admin/payment-gateways/manual" },
          { label: "USDT Gateway", to: "/admin/usdt-gateways/manual" },
        ],
      },
      // { icon: QrCode, label: "Wallet QR Upload", to: "/admin/wallet-qr" },
      { icon: Database, label: "Bulk Operations Log", to: "/admin/bulk-logs" },
    ],
  },
  // {
  //   label: "BOOK MANAGEMENT",
  //   items: [
  //     {
  //       icon: LayoutDashboard,
  //       label: "Book Management",
  //       to: "/admin/book-management",
  //       children: [
  //         { label: "A Book Management", to: "/admin/book-management/a-book" },
  //         { label: "B Book Management", to: "/admin/book-management/b-book" },
  //         { label: "Combined Book", to: "/admin/book-management/combined" },
  //         { label: "Liquidity Pool Report", to: "/admin/book-management/liquidity-pool" },
  //       ],
  //     },
  //   ],
  // },
 
  
 
 
  // {
  //   label: "REPORTS",
  //   items: [
  //     { icon: BarChart3, label: "Book PnL", to: "/admin/book-pnl" },
  //     { icon: Calculator, label: "Profit & Loss", to: "/admin/finance" },
  //     { icon: FileText, label: "LP Statement", to: "/admin/lp-statement" },
  //     { icon: ClipboardList, label: "Partner Report", to: "/admin/ib-dashboard" },
  //   ],
  // },
  {
    label: "SYSTEM",
    items: [
      // { icon: ServerCog, label: "MT5 Connection", to: "/admin/mt5-connection" },
      { icon: ShieldCheck, label: "Roles", to: "/admin/roles" },
      { icon: KeySquare, label: "Assign Roles", to: "/admin/assign-roles" },
      { icon: UserCog, label: "Admin Profile", to: "/admin/profile" },
      { icon: Settings, label: "Logout", to: "/logout" },
    ],
  },
];

/* -------------------- USER -------------------- */
export const USER_MENU = [
  {
    label: "HOME",
    items: [{ icon: LayoutDashboard, label: "Dashboard", to: "/u/dashboard" }],
  },
  {
    label: "MY ACCOUNT",
    items: [
      {
        icon: Users,
        label: "My Account",
        to: "/u/account",
        children: [
          { label: "Open Trading Account", to: "/u/open-account" },
          { label: "My Accounts", to: "/u/my-accounts" },
          { label: "Account Overview", to: "/u/account-overview" },
        ],
      },
      { icon: Wallet, label: "My Wallet", to: "/u/wallet" },
      { icon: Activity, label: "Account Analytics", to: "/u/trades-performance" },
      { icon: CreditCard, label: "Payment Details", to: "/u/payment-details" },
    ],
  },
  {
    label: "FUNDS",
    items: [
      {
        icon: Banknote,
        label: "Funds",
        to: "/u/funds",
        children: [
          { label: "Deposit", to: "/u/funds/deposit" },
          { label: "Withdrawal", to: "/u/funds/withdrawal" },
          { label: "Internal Transfer", to: "/u/funds/transfer" },
          { label: "Transaction History", to: "/u/funds/transactions" },
        ],
      },
    ],
  },
  {
    label: "SOCIAL TRADING",
    items: [
      { icon: Copy, label: "Copier Portal", to: "/u/social/copier" },
      { icon: Layers, label: "PAMM Portal", to: "/u/social/pamm" },
    ],
  },
  {
    label: "IB PORTAL",
    items: [
      { icon: GitBranch, label: "Apply IB", to: "/u/ib/apply" },
      { icon: BarChart3, label: "IB Dashboard", to: "/u/ib/dashboard" },
    ],
  },
  {
    label: "TRADING",
    items: [
      { icon: Terminal, label: "Web Terminal", to: "/u/web-terminal" },
    ],
  },
  {
    label: "SUPPORT & SETTINGS",
    items: [
      { icon: Headphones, label: "Helpdesk", to: "/u/helpdesk" },
      { icon: Settings, label: "Profile", to: "/u/settings/profile" },
      { icon: Settings, label: "Logout", to: "/u/logout" },
    ],
  },
];
