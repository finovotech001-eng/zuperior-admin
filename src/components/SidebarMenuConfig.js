import {
  LayoutDashboard, Users, ShieldCheck, Settings, ServerCog, PlugZap, Database, Building2, Mail,
  Boxes, FolderKanban, LineChart, BarChart3, Calculator, FileText, ClipboardList,
  KeySquare, UserCog, Banknote, IndianRupee, Newspaper, Signal, Link,
  GitBranch, Network, Copy, Layers, ListChecks, Wallet, CreditCard, QrCode, Activity, Terminal, Headphones
} from "lucide-react";

// Role-based feature access based on actual sidebar menu
export const ROLE_FEATURES = {
  superadmin: [
    'dashboard', 'users', 'kyc', 'mt5', 'deposits', 'withdrawals', 
    'payment-gateways', 'payment-details', 'bulk-logs', 'assign-roles', 'profile',
    // reports
    'reports', 'book-pnl', 'finance', 'lp-statement', 'ib-dashboard'
  ],
  admin: [
    'dashboard', 'users', 'kyc', 'mt5', 'deposits', 'withdrawals', 
    'payment-gateways', 'payment-details', 'bulk-logs',
    // reports
    'reports', 'book-pnl', 'finance', 'lp-statement', 'ib-dashboard'
  ],
  moderator: [
    'dashboard', 'users', 'kyc', 'bulk-logs'
  ],
  support: [
    'dashboard', 'users', 'kyc'
  ],
  analyst: [
    'dashboard', 'users', 'kyc', 'bulk-logs'
  ]
};

// Function to filter menu based on admin role
export function getMenuForRole(role) {
  const allowedFeatures = ROLE_FEATURES[role] || ROLE_FEATURES.admin;
  
  return ADMIN_MENU.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Extract the path from the 'to' property
      const path = item.to.split('/').pop() || item.to;
      return allowedFeatures.includes(path);
    })
  })).filter(section => section.items.length > 0);
}

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
    items: [{ icon: LineChart, label: "Dashboard", to: "dashboard" }],
  },
  {
    label: "CLIENTS & ACCESS",
    items: [
      {
        icon: Users,
        label: "Manage Users",
        to: "users",
        children: [
          { label: "Add User", to: "users/add" },
          { label: "All Users", to: "users/all" },
          { label: "Active Users", to: "users/active" },
          { label: "Banned Users", to: "users/banned" },
          { label: "Email Unverified", to: "users/email-unverified" },
          { label: "With Balance", to: "users/with-balance" },
        ],
      },
      { icon: ShieldCheck, label: "KYC Verifications", to: "kyc" },
      // { icon: Users, label: "Manage MT5 Groups", to: "add-group" },
    
    ],
  },
  {
    label: "SUPPORT",
    items: [
      {
        icon: Headphones,
        label: "Support Tickets",
        to: "support/open",
        children: [
          { label: "Opened Tickets", to: "support/open" },
         
          { label: "Closed Tickets", to: "support/closed" },
        ],
      },
    ],
  },
  {
    label: "MT5 MANAGEMENT",
    items: [
      {
        icon: LayoutDashboard,
        label: "MT5 Management",
        to: "mt5",
        children: [
          { label: "MT5 Users List", to: "mt5/users" },
          { label: "Assign MT5 to Email", to: "mt5/assign" },
          // { label: "Balance Operations", to: "mt5/balance-operations" },
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
        to: "deposits",
        children: [
          { label: "Pending Deposits", to: "deposits/pending" },
          { label: "Approved Deposits", to: "deposits/approved" },
          { label: "Rejected Deposits", to: "deposits/rejected" },
          { label: "All Deposits", to: "deposits/all" },
        ],
      },
      {
        icon: Calculator,
        label: "Manage Withdrawals",
        to: "withdrawals",
        children: [
          { label: "Pending Withdrawals", to: "withdrawals/pending" },
          { label: "Approved Withdrawals", to: "withdrawals/approved" },
          { label: "Rejected Withdrawals", to: "withdrawals/rejected" },
          { label: "All Withdrawals", to: "withdrawals/all" },
        ],
      },
      {
        icon: CreditCard,
        label: "Payment Gateways",
        to: "payment-gateways",
        children: [
          { label: "Deposit Gateway", to: "payment-gateways/automatic" },
          { label: "Manual Gateways", to: "payment-gateways/manual" },
        ],
      },
      { icon: CreditCard, label: "Payment Details", to: "payment-details" },
      // { icon: QrCode, label: "Wallet QR Upload", to: "wallet-qr" },
      { icon: Database, label: "Bulk Operations Log", to: "bulk-logs" },
    ],
  },
  // {
  //   label: "BOOK MANAGEMENT",
  //   items: [
  //     {
  //       icon: LayoutDashboard,
  //       label: "Book Management",
  //       to: "book-management",
  //       children: [
  //         { label: "A Book Management", to: "book-management/a-book" },
  //         { label: "B Book Management", to: "book-management/b-book" },
  //         { label: "Combined Book", to: "book-management/combined" },
  //         { label: "Liquidity Pool Report", to: "book-management/liquidity-pool" },
  //       ],
  //     },
  //   ],
  // },
  {
    label: "REPORTS",
    items: [
      {
        icon: BarChart3,
        label: "Reports",
        to: "reports",
        children: [
          { label: "Book PnL", to: "book-pnl", icon: Calculator },
          { label: "Profit & Loss", to: "finance", icon: BarChart3 },
          { label: "LP Statement", to: "lp-statement", icon: FileText },
          { label: "Partner Report", to: "ib-dashboard", icon: ClipboardList },
        ],
      },
    ],
  },
  {
    label: "COUNTRY PARTNER ADMIN",
    items: [
      { icon: Users, label: "Assign Country Partner", to: "/admin/assign-country-partner" },
      { icon: ShieldCheck, label: "Assigned Country Admins", to: "/admin/assigned-country-admins" },
    ]
  },
  {
    label: "SYSTEM",
    items: [
      // { icon: ServerCog, label: "MT5 Connection", to: "mt5-connection" },
      { icon: KeySquare, label: "Assign Roles", to: "assign-roles" },
      { icon: UserCog, label: "Admin Profile", to: "profile" },
      { icon: Settings, label: "Logout", to: "logout" },
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
