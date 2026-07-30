import { Routes, Route, Navigate } from "react-router-dom";
import {
    SupplierList,
    AddSupplier,
    EditSupplier,
    SupplierLedger,
} from "@/features/customers";
import {
    CategoryList,
    AddCategory,
    EditCategory,
} from "@/features/categories";
import {
    BrandList,
    AddBrand,
    EditBrand,
} from "@/features/brands";
import {
    UnitList,
    AddUnit,
    EditUnit,
} from "@/features/units";
import {
    ProductList,
    AddProduct,
    EditProduct,
    ProductDetails,
} from "@/features/products";
import {
    StockDashboard,
    StockMovements,
} from "@/features/stock";
import {
    PosPage,
    ReceiptPage,
} from "@/features/pos";
import {
    SalesList,
    SaleDetails,
} from "@/features/sales";
import { AccountsPage } from "@/features/accounting";
import { ExpensesPage } from "@/features/expenses";
import { PaymentsPage } from "@/features/payments";
import { ReportsPage } from "@/features/reports";
import PurchasesPage from "@/features/purchases/PurchasesPage";
import PurchaseReturnsPage from "@/features/purchases/PurchaseReturnsPage";
import SalesReturnsPage from "@/features/sales/pages/SalesReturnsPage";
import IncomePage from "@/features/income/pages/IncomePage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import UserManagementPage from "@/features/users/pages/UserManagementPage";

import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import CustomerList from "@/features/customers/pages/CustomerList";
import AddCustomer from "@/features/customers/pages/AddCustomer";
import EditCustomer from "@/features/customers/pages/EditCustomer";
import CustomerLedger from "@/features/customers/pages/CustomerLedger";
import CustomerLedgerIndex from "@/features/customers/pages/CustomerLedgerIndex";
import WalkingCustomersPage from "@/features/customers/pages/WalkingCustomersPage";
import SupplierLedgerIndex from "@/features/customers/pages/SupplierLedgerIndex";
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
<Route path="/customers" element={<ProtectedRoute><CustomerList/></ProtectedRoute>}/>
<Route path="/walking-customers" element={<ProtectedRoute><WalkingCustomersPage/></ProtectedRoute>}/>
<Route path="/customer-ledger" element={<ProtectedRoute><CustomerLedgerIndex/></ProtectedRoute>}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/customers/new" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>}/>
      <Route path="/customers/:id/edit"element={<ProtectedRoute><EditCustomer /></ProtectedRoute>}/>
      <Route path="/customers/:id/ledger" element={<ProtectedRoute><CustomerLedger /></ProtectedRoute>}/>
      <Route path="/suppliers" element={<ProtectedRoute><SupplierList /></ProtectedRoute>} />
      <Route path="/supplier-ledger" element={<ProtectedRoute><SupplierLedgerIndex /></ProtectedRoute>} />
      <Route path="/suppliers/add" element={<ProtectedRoute><AddSupplier /></ProtectedRoute>} />
      <Route path="/suppliers/:id/edit" element={<ProtectedRoute><EditSupplier /></ProtectedRoute>} />
      <Route path="/suppliers/:id/ledger" element={<ProtectedRoute><SupplierLedger /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
      <Route path="/categories/new" element={<ProtectedRoute><AddCategory /></ProtectedRoute>} />
      <Route path="/categories/:id/edit" element={<ProtectedRoute><EditCategory /></ProtectedRoute>} />
      <Route path="/brands" element={<ProtectedRoute><BrandList /></ProtectedRoute>} />
      <Route path="/brands/new" element={<ProtectedRoute><AddBrand /></ProtectedRoute>} />
      <Route path="/brands/:id/edit" element={<ProtectedRoute><EditBrand /></ProtectedRoute>} />
      <Route path="/units" element={<ProtectedRoute><UnitList /></ProtectedRoute>} />
      <Route path="/units/new" element={<ProtectedRoute><AddUnit /></ProtectedRoute>} />
      <Route path="/units/:id/edit" element={<ProtectedRoute><EditUnit /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
      <Route path="/products/new" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
      <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
      <Route path="/purchases/new" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
      <Route path="/purchase-return" element={<ProtectedRoute><PurchaseReturnsPage /></ProtectedRoute>} />
      <Route path="/stock" element={<ProtectedRoute><StockDashboard /></ProtectedRoute>} />
      <Route path="/stock/movements" element={<ProtectedRoute><StockMovements /></ProtectedRoute>} />
      <Route path="/stock-adjustment" element={<ProtectedRoute><StockDashboard /></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><PosPage /></ProtectedRoute>} />
      <Route path="/pos/receipt/:id" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><SalesList /></ProtectedRoute>} />
      <Route path="/sales-return" element={<ProtectedRoute><SalesReturnsPage /></ProtectedRoute>} />
      <Route path="/sales/:id" element={<ProtectedRoute><SaleDetails /></ProtectedRoute>} />
      <Route path="/sales/:id/edit" element={<ProtectedRoute><SaleDetails /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserManagementPage view="users" /></ProtectedRoute>} />
      <Route path="/roles" element={<ProtectedRoute><UserManagementPage view="roles" /></ProtectedRoute>} />
      <Route path="/permissions" element={<ProtectedRoute><UserManagementPage view="permissions" /></ProtectedRoute>} />
      <Route path="/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
      <Route path="/cash-book" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
      <Route path="/expense" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage initialType="sales" /></ProtectedRoute>} />
      <Route path="/sales-report" element={<ProtectedRoute><ReportsPage initialType="sales" /></ProtectedRoute>} />
      <Route path="/purchase-report" element={<ProtectedRoute><ReportsPage initialType="purchases" /></ProtectedRoute>} />
      <Route path="/product-report" element={<ProtectedRoute><ReportsPage initialType="products" /></ProtectedRoute>} />
      <Route path="/stock-report" element={<ProtectedRoute><ReportsPage initialType="stock" /></ProtectedRoute>} />
      <Route path="/customer-report" element={<ProtectedRoute><ReportsPage initialType="customers" /></ProtectedRoute>} />
      <Route path="/supplier-report" element={<ProtectedRoute><ReportsPage initialType="suppliers" /></ProtectedRoute>} />
      <Route path="/expense-report" element={<ProtectedRoute><ReportsPage initialType="expenses" /></ProtectedRoute>} />
      <Route path="/income-report" element={<ProtectedRoute><ReportsPage initialType="incomes" /></ProtectedRoute>} />
      <Route path="/payment-report" element={<ProtectedRoute><ReportsPage initialType="payments" /></ProtectedRoute>} />
      <Route path="/profit-loss" element={<ProtectedRoute><ReportsPage initialType="sales" /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}







