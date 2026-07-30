import {
  LayoutDashboard,
  Users,
  Truck,
  Boxes,
  ShoppingCart,
  Package,
  Receipt,
  Wallet,
  FileBarChart,
  Settings,
  Shield,
  Tag,
  Ruler,
  Layers,
  RotateCcw,
  ClipboardList,
  BarChart3
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard"
  },

  {
    title: "Customer Management",
    icon: Users,

    children: [
      {
        title: "Customers",
        url: "/customers"
      },

      {
        title: "Walking Customers",
        url: "/walking-customers"
      },

      {
        title: "Customer Ledger",
        url: "/customer-ledger"
      }
    ]
  },

  {
    title: "Supplier Management",
    icon: Truck,

    children: [
      {
        title: "Suppliers",
        url: "/suppliers"
      },

      {
        title: "Supplier Ledger",
        url: "/supplier-ledger"
      }
    ]
  },

  {
    title: "Product Management",
    icon: Boxes,

    children: [
      {
        title: "Categories",
        url: "/categories"
      },

      {
        title: "Brands",
        url: "/brands"
      },

      {
        title: "Units",
        url: "/units"
      },

      {
        title: "Products",
        url: "/products"
      }
    ]
  },

  {
    title: "Purchase Management",
    icon: ShoppingCart,

    children: [
      {
        title: "Purchases",
        url: "/purchases"
      },

      {
        title: "Purchase Return",
        url: "/purchase-return"
      }
    ]
  },

  {
    title: "Stock Management",
    icon: Package,

    children: [
      {
        title: "Stock",
        url: "/stock"
      },

      {
        title: "Adjustment",
        url: "/stock-adjustment"
      }
    ]
  },

  {
    title: "Invoice Management",
    icon: Receipt,

    children: [
      {
        title: "POS",
        url: "/pos"
      },

      {
        title: "Sales",
        url: "/sales"
      },

      {
        title: "Sales Return",
        url: "/sales-return"
      }
    ]
  },

  {
    title: "Accounts",
    icon: Wallet,

    children: [
      {
        title: "Income",
        url: "/income"
      },

      {
        title: "Expense",
        url: "/expense"
      },

      {
        title: "Cash Book",
        url: "/cash-book"
      }
    ]
  },

  {
    title: "Reports",
    icon: FileBarChart,

    children: [
      { title: "Sales Report", url: "/sales-report" },
      { title: "Purchase Report", url: "/purchase-report" },
      { title: "Product Report", url: "/product-report" },
      { title: "Stock Report", url: "/stock-report" },
      { title: "Customer Report", url: "/customer-report" },
      { title: "Supplier Report", url: "/supplier-report" },
      { title: "Expense Report", url: "/expense-report" },
      { title: "Income Report", url: "/income-report" },
      { title: "Payment Report", url: "/payment-report" }
    ]
  },

  {
    title: "User Management",
    icon: Shield,

    children: [
      {
        title: "Users",
        url: "/users"
      },

      {
        title: "Roles",
        url: "/roles"
      },

      {
        title: "Permissions",
        url: "/permissions"
      }
    ]
  },

  {
    title: "Settings",
    icon: Settings,
    url: "/settings"
  }
];


