// src/routes/adminRoutes.jsx
import BrandCard from "../components/BrandCard.jsx";
import ProTable from "../components/ProTable.jsx";
import EmptyState from "../components/EmptyState.jsx";
import KycList from "../pages/admin/KycList.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import UsersAll from "../pages/admin/UsersAll.jsx";
import UsersView from "../pages/admin/UsersView.jsx";
import UsersActive from "../pages/admin/UsersActive.jsx";
import UsersBanned from "../pages/admin/UsersBanned.jsx";
import UsersEmailUnverified from "../pages/admin/UsersEmailUnverified.jsx";
import AddUser from "../pages/admin/AddUser.jsx";
import UsersWithBalance from "../pages/admin/UsersWithBalance.jsx";
import MT5Users from "../pages/admin/MT5Users.jsx";
import MT5Assign from "../pages/admin/MT5Assign.jsx";
import DepositsPending from "../pages/admin/DepositsPending.jsx";
import DepositsApproved from "../pages/admin/DepositsApproved.jsx";
import DepositsRejected from "../pages/admin/DepositsRejected.jsx";
import DepositsAll from "../pages/admin/DepositsAll.jsx";
import WithdrawalsPending from "../pages/admin/WithdrawalsPending.jsx";
import WithdrawalsApproved from "../pages/admin/WithdrawalsApproved.jsx";
import WithdrawalsRejected from "../pages/admin/WithdrawalsRejected.jsx";
import WithdrawalsAll from "../pages/admin/WithdrawalsAll.jsx";
import BulkLogs from "../pages/admin/BulkLogs.jsx";
import SendEmails from "../pages/admin/SendEmails.jsx";
/** Admin Dashboard */

export default [
  /* ----------------------------- TRADING ------------------------------ */
  { path: "/admin/dashboard",     element: <Dashboard /> },
  { path: "/admin/book-positions",element: <EmptyState title="Book Positions" subtitle="Monitor open positions" /> },
  { path: "/admin/book-deals",    element: <EmptyState title="Book Deals" subtitle="All trade deals" /> },
  { path: "/admin/traded-lots",   element: <EmptyState title="Open Tickets" subtitle="All traded lots" /> },
  { path: "/admin/my-deals",      element: <EmptyState title="My Deals" subtitle="My executed trades" /> },

  /* ----------------------------- REPORTS ------------------------------ */
  { path: "/admin/book-pnl",      element: <EmptyState title="Book PnL" subtitle="Performance by book" /> },
  { path: "/admin/finance",       element: <EmptyState title="Profit & Loss" subtitle="PnL breakdown" /> },
  { path: "/admin/lp-statement",  element: <EmptyState title="LP Statement" subtitle="Liquidity provider statements" /> },
  { path: "/admin/ib-dashboard",  element: <EmptyState title="Partner Report" subtitle="IB performance" /> },

  /* ------------------------ CLIENTS & ACCESS -------------------------- */
  { path: "/admin/users",                     element: <EmptyState title="Manage Users" subtitle="User management overview" /> },
  { path: "/admin/users/add",                 element: <AddUser /> },
  { path: "/admin/users/all",                 element: <UsersAll /> },
  { path: "/admin/users/:id",                 element: <UsersView /> },
  { path: "/admin/users/active",              element: <UsersActive /> },
  { path: "/admin/users/banned",              element: <UsersBanned /> },
  { path: "/admin/users/email-unverified",    element: <UsersEmailUnverified /> },
  { path: "/admin/users/kyc-unverified",      element: <EmptyState title="KYC Unverified" subtitle="Users without KYC" /> },
  { path: "/admin/users/kyc-pending",         element: <EmptyState title="KYC Pending" subtitle="Awaiting review" /> },
  { path: "/admin/users/with-balance",        element: <UsersWithBalance /> },
  { path: "/admin/kyc",                       element: <KycList /> },
  { path: "/admin/add-group",                 element: <EmptyState title="Client Groups" subtitle="Manage client groups" /> },
  { path: "/admin/activity-logs",             element: <EmptyState title="Activity / Login Logs" subtitle="Audit trail & logins" /> },

  /* --------------------------- BOOK MGMT ------------------------------ */
  { path: "/admin/book-management",                 element: <EmptyState title="Book Management" subtitle="Configure A/B/Combined books" /> },
  { path: "/admin/book-management/a-book",          element: <EmptyState title="A Book Management" subtitle="A-Book routing & settings" /> },
  { path: "/admin/book-management/b-book",          element: <EmptyState title="B Book Management" subtitle="B-Book risk & exposure" /> },
  { path: "/admin/book-management/combined",        element: <EmptyState title="Combined Book" subtitle="Aggregated view" /> },
  { path: "/admin/book-management/liquidity-pool",  element: <EmptyState title="Liquidity Pool Report" subtitle="Pool balances & flow" /> },

  /* --------------------------- IB MANAGEMENT -------------------------- */
  { path: "/admin/ib",                     element: <EmptyState title="IB Management" subtitle="Overview" /> },
  { path: "/admin/ib/dashboard",           element: <EmptyState title="IB Dashboard" subtitle="KPIs & summary" /> },
  { path: "/admin/ib/requests",            element: <EmptyState title="IB Requests" subtitle="Pending onboarding" /> },
  { path: "/admin/ib/profiles",            element: <EmptyState title="IB Profiles" subtitle="Manage IB details" /> },
  { path: "/admin/ib/commission",          element: <EmptyState title="Set IB Commission" subtitle="Tiers & rates" /> },
  { path: "/admin/ib/structure",           element: <EmptyState title="Set IB Structure" subtitle="Hierarchy settings" /> },
  { path: "/admin/ib/withdrawals",         element: <EmptyState title="IB Withdrawals" subtitle="Partner payouts" /> },
  { path: "/admin/ib/move-user",           element: <EmptyState title="Move User to IB" subtitle="Reassign client to IB" /> },
  { path: "/admin/ib/plans",               element: <EmptyState title="IB Plans" subtitle="Commission plans" /> },
  { path: "/admin/ib/manage",              element: <EmptyState title="Manage IBs" subtitle="IB account management" /> },
  { path: "/admin/ib/map",                 element: <EmptyState title="Map IBs" subtitle="Attach clients to IBs" /> },
  { path: "/admin/ib/commission-logs",     element: <EmptyState title="Commission Logs" subtitle="Earnings history" /> },

  /* -------------------------- PAMM MANAGEMENT ------------------------- */
  { path: "/admin/pamm",               element: <EmptyState title="PAMM Management" subtitle="Overview" /> },
  { path: "/admin/pamm/settings",      element: <EmptyState title="PAMM Settings" subtitle="Pools, fees, rules" /> },
  { path: "/admin/pamm/requests",      element: <EmptyState title="PAMM Requests" subtitle="Pending manager requests" /> },
  { path: "/admin/pamm/deposits",      element: <EmptyState title="PAMM Deposits" subtitle="Investor deposits" /> },
  { path: "/admin/pamm/investors",     element: <EmptyState title="PAMM Investors" subtitle="Investor list & allocations" /> },
  { path: "/admin/pamm/performance",   element: <EmptyState title="PAMM Performance" subtitle="Pool performance & metrics" /> },

  /* ------------------------- COPIER MANAGEMENT ------------------------ */
  { path: "/admin/copier",             element: <EmptyState title="Copier Management" subtitle="Overview" /> },
  { path: "/admin/copier/masters",     element: <EmptyState title="Copy Masters" subtitle="Catalog & stats" /> },
  { path: "/admin/copier/requests",    element: <EmptyState title="Copy Requests" subtitle="Onboarding & limits" /> },

  /* --------------------------- MT5 MANAGEMENT ------------------------- */
  { path: "/admin/mt5",            element: <EmptyState title="MT5 Management" subtitle="Manager tools" /> },
  { path: "/admin/mt5/users",      element: <MT5Users /> },
  { path: "/admin/mt5/assign",     element: <MT5Assign /> },
  { path: "/admin/mt5/transfer",   element: <EmptyState title="Internal Transfer" subtitle="Move funds internally" /> },

  /* --------------------------- FINANCE & OPS -------------------------- */
  // Deposits
  { path: "/admin/deposits",              element: <EmptyState title="Manage Deposits" subtitle="Overview" /> },
  { path: "/admin/deposits/pending",      element: <DepositsPending /> },
  { path: "/admin/deposits/approved",     element: <DepositsApproved /> },
  { path: "/admin/deposits/rejected",     element: <DepositsRejected /> },
  { path: "/admin/deposits/all",          element: <DepositsAll /> },

  // Withdrawals
  { path: "/admin/withdrawals",           element: <EmptyState title="Manage Withdrawals" subtitle="Overview" /> },
  { path: "/admin/withdrawals/pending",   element: <WithdrawalsPending /> },
  { path: "/admin/withdrawals/approved",  element: <WithdrawalsApproved /> },
  { path: "/admin/withdrawals/rejected",  element: <WithdrawalsRejected /> },
  { path: "/admin/withdrawals/all",       element: <WithdrawalsAll /> },

  // Payment Gateways
  { path: "/admin/payment-gateways",              element: <EmptyState title="Payment Gateways" subtitle="Automatic & manual gateways" /> },
  { path: "/admin/payment-gateways/automatic",    element: <EmptyState title="Automatic Gateways" subtitle="API integrations" /> },
  { path: "/admin/payment-gateways/manual",       element: <EmptyState title="Manual Gateways" subtitle="Manual approval methods" /> },
  { path: "/admin/usdt-gateways/manual",       element: <EmptyState title="USDT Gateway" subtitle="USDT Gateway Integration" /> },

  { path: "/admin/wallet-qr",          element: <EmptyState title="Wallet QR Upload" subtitle="Upload deposit QR codes" /> },
  { path: "/admin/bulk-logs",          element: <BulkLogs /> },
  { path: "/admin/send-emails",        element: <SendEmails /> },

   /* ----------------------- FUNDS & INVESTMENTS ------------------------ */
  { path: "/admin/fund-investments",    element: <EmptyState title="Fund Investments" subtitle="Incoming funds overview" /> },
  { path: "/admin/manage-investments",  element: <EmptyState title="Manage Investments" subtitle="Allocate / redeem" /> },
  { path: "/admin/fund-wallets",        element: <EmptyState title="Fund Wallets" subtitle="Corporate wallets" /> },

  /* ------------------------------ SYSTEM ------------------------------ */
  { path: "/admin/mt5-connection",      element: <EmptyState title="MT5 Connection" subtitle="Manager API credentials" /> },
  { path: "/admin/smtp-connection",     element: <EmptyState title="SMTP Connection" subtitle="Email server settings" /> },
  { path: "/admin/settings",            element: <EmptyState title="System Settings" subtitle="Branding, storage, integrations" /> },
  { path: "/admin/roles",               element: <EmptyState title="Roles" subtitle="Create & manage roles" /> },
  { path: "/admin/assign-roles",        element: <EmptyState title="Assign Roles" subtitle="Attach roles to users" /> },
  { path: "/admin/prize-lots",          element: <EmptyState title="Manage Prize Lots" subtitle="Promo lots" /> },
  { path: "/admin/lot-pricing",         element: <EmptyState title="Set Lot Pricing" subtitle="Pricing matrix" /> },
  { path: "/admin/prize-distribution",  element: <EmptyState title="Prize Distribution" subtitle="Campaign payouts" /> },
  { path: "/admin/profile",             element: <EmptyState title="Admin Profile" subtitle="Profile & preferences" /> },

  /* ------------------------------ AUTH -------------------------------- */
  { path: "/logout", element: <EmptyState title="Logging out" subtitle="Clearing session & redirect…" /> },
];
