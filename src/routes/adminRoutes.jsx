// src/routes/adminRoutes.jsx
import BrandCard from "../components/BrandCard.jsx";
import ProTable from "../components/ProTable.jsx";
import EmptyState from "../components/EmptyState.jsx";
import KycList from "../pages/admin/KycList.jsx";
import Dashboard from "../pages/admin/Dashboard.jsx";
import UsersAll from "../pages/admin/UsersAll.jsx";
import AssignRoles from "../pages/admin/AssignRoles.jsx";
import AdminProfile from "../pages/admin/AdminProfile.jsx";
import PaymentGatewaysAutomatic from "../pages/admin/PaymentGatewaysAutomatic.jsx";
import PaymentGatewaysManual from "../pages/admin/PaymentGatewaysManual.jsx";
import UsersView from "../pages/admin/UsersView.jsx";
import UsersActive from "../pages/admin/UsersActive.jsx";
import UsersBanned from "../pages/admin/UsersBanned.jsx";
import UsersEmailUnverified from "../pages/admin/UsersEmailUnverified.jsx";
import AddUser from "../pages/admin/AddUser.jsx";
import UsersWithBalance from "../pages/admin/UsersWithBalance.jsx";
import MT5Users from "../pages/admin/MT5Users.jsx";
import MT5Assign from "../pages/admin/MT5Assign.jsx";
import BalanceOperations from "../pages/admin/BalanceOperations.jsx";
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
import Logout from "../pages/admin/Logout.jsx";
/** Admin Dashboard */

export default [
  /* ----------------------------- TRADING ------------------------------ */
  { path: "dashboard",     element: <Dashboard /> },
  { path: "book-positions",element: <EmptyState title="Book Positions" subtitle="Monitor open positions" /> },
  { path: "book-deals",    element: <EmptyState title="Book Deals" subtitle="All trade deals" /> },
  { path: "traded-lots",   element: <EmptyState title="Open Tickets" subtitle="All traded lots" /> },
  { path: "my-deals",      element: <EmptyState title="My Deals" subtitle="My executed trades" /> },

  /* ----------------------------- REPORTS ------------------------------ */
  { path: "book-pnl",      element: <EmptyState title="Book PnL" subtitle="Performance by book" /> },
  { path: "finance",       element: <EmptyState title="Profit & Loss" subtitle="PnL breakdown" /> },
  { path: "lp-statement",  element: <EmptyState title="LP Statement" subtitle="Liquidity provider statements" /> },
  { path: "ib-dashboard",  element: <EmptyState title="Partner Report" subtitle="IB performance" /> },

  /* ------------------------ CLIENTS & ACCESS -------------------------- */
  { path: "users",                     element: <EmptyState title="Manage Users" subtitle="User management overview" /> },
  { path: "users/add",                 element: <AddUser /> },
  { path: "users/all",                 element: <UsersAll /> },
  { path: "users/:id",                 element: <UsersView /> },
  { path: "users/active",              element: <UsersActive /> },
  { path: "users/banned",              element: <UsersBanned /> },
  { path: "users/email-unverified",    element: <UsersEmailUnverified /> },
  { path: "users/kyc-unverified",      element: <EmptyState title="KYC Unverified" subtitle="Users without KYC" /> },
  { path: "users/kyc-pending",         element: <EmptyState title="KYC Pending" subtitle="Awaiting review" /> },
  { path: "users/with-balance",        element: <UsersWithBalance /> },
  { path: "kyc",                       element: <KycList /> },
  { path: "add-group",                 element: <EmptyState title="Client Groups" subtitle="Manage client groups" /> },
  { path: "activity-logs",             element: <EmptyState title="Activity / Login Logs" subtitle="Audit trail & logins" /> },

  /* --------------------------- BOOK MGMT ------------------------------ */
  { path: "book-management",                 element: <EmptyState title="Book Management" subtitle="Configure A/B/Combined books" /> },
  { path: "book-management/a-book",          element: <EmptyState title="A Book Management" subtitle="A-Book routing & settings" /> },
  { path: "book-management/b-book",          element: <EmptyState title="B Book Management" subtitle="B-Book risk & exposure" /> },
  { path: "book-management/combined",        element: <EmptyState title="Combined Book" subtitle="Aggregated view" /> },
  { path: "book-management/liquidity-pool",  element: <EmptyState title="Liquidity Pool Report" subtitle="Pool balances & flow" /> },

  /* --------------------------- IB MANAGEMENT -------------------------- */
  { path: "ib",                     element: <EmptyState title="IB Management" subtitle="Overview" /> },
  { path: "ib/dashboard",           element: <EmptyState title="IB Dashboard" subtitle="KPIs & summary" /> },
  { path: "ib/requests",            element: <EmptyState title="IB Requests" subtitle="Pending onboarding" /> },
  { path: "ib/profiles",            element: <EmptyState title="IB Profiles" subtitle="Manage IB details" /> },
  { path: "ib/commission",          element: <EmptyState title="Set IB Commission" subtitle="Tiers & rates" /> },
  { path: "ib/structure",           element: <EmptyState title="Set IB Structure" subtitle="Hierarchy settings" /> },
  { path: "ib/withdrawals",         element: <EmptyState title="IB Withdrawals" subtitle="Partner payouts" /> },
  { path: "ib/move-user",           element: <EmptyState title="Move User to IB" subtitle="Reassign client to IB" /> },
  { path: "ib/plans",               element: <EmptyState title="IB Plans" subtitle="Commission plans" /> },
  { path: "ib/manage",              element: <EmptyState title="Manage IBs" subtitle="IB account management" /> },
  { path: "ib/map",                 element: <EmptyState title="Map IBs" subtitle="Attach clients to IBs" /> },
  { path: "ib/commission-logs",     element: <EmptyState title="Commission Logs" subtitle="Earnings history" /> },

  /* -------------------------- PAMM MANAGEMENT ------------------------- */
  { path: "pamm",               element: <EmptyState title="PAMM Management" subtitle="Overview" /> },
  { path: "pamm/settings",      element: <EmptyState title="PAMM Settings" subtitle="Pools, fees, rules" /> },
  { path: "pamm/requests",      element: <EmptyState title="PAMM Requests" subtitle="Pending manager requests" /> },
  { path: "pamm/deposits",      element: <EmptyState title="PAMM Deposits" subtitle="Investor deposits" /> },
  { path: "pamm/investors",     element: <EmptyState title="PAMM Investors" subtitle="Investor list & allocations" /> },
  { path: "pamm/performance",   element: <EmptyState title="PAMM Performance" subtitle="Pool performance & metrics" /> },

  /* ------------------------- COPIER MANAGEMENT ------------------------ */
  { path: "copier",             element: <EmptyState title="Copier Management" subtitle="Overview" /> },
  { path: "copier/masters",     element: <EmptyState title="Copy Masters" subtitle="Catalog & stats" /> },
  { path: "copier/requests",    element: <EmptyState title="Copy Requests" subtitle="Onboarding & limits" /> },

  /* --------------------------- MT5 MANAGEMENT ------------------------- */
  { path: "mt5",            element: <EmptyState title="MT5 Management" subtitle="Manager tools" /> },
  { path: "mt5/users",      element: <MT5Users /> },
  { path: "mt5/assign",     element: <MT5Assign /> },
  { path: "mt5/balance-operations", element: <BalanceOperations /> },
  { path: "mt5/transfer",   element: <EmptyState title="Internal Transfer" subtitle="Move funds internally" /> },

  /* --------------------------- FINANCE & OPS -------------------------- */
  // Deposits
  { path: "deposits",              element: <EmptyState title="Manage Deposits" subtitle="Overview" /> },
  { path: "deposits/pending",      element: <DepositsPending /> },
  { path: "deposits/approved",     element: <DepositsApproved /> },
  { path: "deposits/rejected",     element: <DepositsRejected /> },
  { path: "deposits/all",          element: <DepositsAll /> },

  // Withdrawals
  { path: "withdrawals",           element: <EmptyState title="Manage Withdrawals" subtitle="Overview" /> },
  { path: "withdrawals/pending",   element: <WithdrawalsPending /> },
  { path: "withdrawals/approved",  element: <WithdrawalsApproved /> },
  { path: "withdrawals/rejected",  element: <WithdrawalsRejected /> },
  { path: "withdrawals/all",       element: <WithdrawalsAll /> },

  // Payment Gateways
  { path: "payment-gateways",              element: <EmptyState title="Payment Gateways" subtitle="Automatic & manual gateways" /> },
  { path: "payment-gateways/automatic",    element: <PaymentGatewaysAutomatic /> },
  { path: "payment-gateways/manual",       element: <PaymentGatewaysManual /> },
  { path: "usdt-gateways/manual",       element: <EmptyState title="USDT Gateway" subtitle="USDT Gateway Integration" /> },

  { path: "wallet-qr",          element: <EmptyState title="Wallet QR Upload" subtitle="Upload deposit QR codes" /> },
  { path: "bulk-logs",          element: <BulkLogs /> },
  { path: "send-emails",        element: <SendEmails /> },

   /* ----------------------- FUNDS & INVESTMENTS ------------------------ */
  { path: "fund-investments",    element: <EmptyState title="Fund Investments" subtitle="Incoming funds overview" /> },
  { path: "manage-investments",  element: <EmptyState title="Manage Investments" subtitle="Allocate / redeem" /> },
  { path: "fund-wallets",        element: <EmptyState title="Fund Wallets" subtitle="Corporate wallets" /> },

  /* ------------------------------ SYSTEM ------------------------------ */
  { path: "mt5-connection",      element: <EmptyState title="MT5 Connection" subtitle="Manager API credentials" /> },
  { path: "smtp-connection",     element: <EmptyState title="SMTP Connection" subtitle="Email server settings" /> },
  { path: "settings",            element: <EmptyState title="System Settings" subtitle="Branding, storage, integrations" /> },
  { path: "roles",               element: <EmptyState title="Roles" subtitle="Create & manage roles" /> },
  { path: "prize-lots",          element: <EmptyState title="Manage Prize Lots" subtitle="Promo lots" /> },
  { path: "lot-pricing",         element: <EmptyState title="Set Lot Pricing" subtitle="Pricing matrix" /> },
  { path: "prize-distribution",  element: <EmptyState title="Prize Distribution" subtitle="Campaign payouts" /> },
  { path: "profile",             element: <AdminProfile /> },
  { path: "assign-roles",        element: <AssignRoles /> },

  /* ------------------------------ AUTH -------------------------------- */
  { path: "logout", element: <Logout /> },
];
