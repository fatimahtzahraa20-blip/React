const SERIES = {
  "24h": [3200, 4100, 3600, 5200, 4800, 6100, 6800, 5900],
  "7d": [4200, 5100, 4800, 6300, 7100, 5600, 6900],
  "30d": [18200, 22400, 20900, 26800, 25100, 31600, 29400, 35200],
  "90d": [52800, 61400, 58900, 67200, 74600, 71100, 82400, 89100, 96400],
};
const LABELS = { "24h": ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"], "7d": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "30d": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"], "90d": ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] };
const KPI = {
  "24h": [["Revenue", "$8,420", "8.2", true], ["Active users", "1,284", "3.4", true], ["Conversion", "4.8%", "0.6", true], ["Avg. session", "5m 18s", "1.1", false]],
  "7d": [["Revenue", "$42,204", "12.4", true], ["Active users", "12,904", "4.1", true], ["Conversion", "5.2%", "0.4", true], ["Avg. session", "6m 42s", "1.2", false]],
  "30d": [["Revenue", "$218,940", "18.7", true], ["Active users", "48,216", "9.3", true], ["Conversion", "5.7%", "0.8", true], ["Avg. session", "7m 05s", "2.4", true]],
  "90d": [["Revenue", "$624,810", "24.1", true], ["Active users", "138,502", "14.6", true], ["Conversion", "5.4%", "0.5", true], ["Avg. session", "6m 51s", "1.8", true]],
};
export const DASHBOARD_DATA = Object.fromEntries(Object.keys(SERIES).map(range => [range, { total: KPI[range][0][1], kpis: KPI[range].map(([label, value, delta, up]) => ({ label, value, delta: `${delta}%`, up })), revenue: SERIES[range].map((revenue, i) => ({ label: LABELS[range][i], revenue })) }]));
export const TRAFFIC_SOURCES = [{ name: "Organic", value: 42 }, { name: "Direct", value: 27 }, { name: "Referral", value: 18 }, { name: "Social", value: 13 }];
export const RECENT_ORDERS = [{ id: "ORD-2291", customer: "Amina Yusuf", amount: "$129.00", status: "success" }, { id: "ORD-2290", customer: "Ben Carter", amount: "$58.50", status: "warn" }, { id: "ORD-2289", customer: "Priya Nair", amount: "$412.00", status: "success" }, { id: "ORD-2288", customer: "Wei Zhang", amount: "$76.20", status: "danger" }, { id: "ORD-2287", customer: "Sofia Rossi", amount: "$210.00", status: "success" }];
export const ACTIVITY = [{ id: 1, text: "Amina Yusuf upgraded to Business plan", time: "2 minutes ago" }, { id: 2, text: "Ben Carter created a new account", time: "18 minutes ago" }, { id: 3, text: "Server deployment v2.4.1 completed", time: "44 minutes ago" }, { id: 4, text: "Priya Nair submitted a support ticket", time: "1 hour ago" }];
