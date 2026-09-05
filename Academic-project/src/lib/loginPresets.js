// Public demonstration account shortcuts, enabled in development and deployment.
// Only configure public demo credentials here; Supabase still authenticates each login.
export const demoLoginEnabled = true;
export const loginPresets = [
 {role:'admin',label:'Admin',description:'Users and academic management',email:import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'Main@gmail.com',password:import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'admin123!'},
 {role:'hod',label:'HOD',description:'Department planning and approvals',email:import.meta.env.VITE_DEMO_HOD_EMAIL || 'hod@example.test',password:import.meta.env.VITE_DEMO_HOD_PASSWORD || 'DemoHod123!'},
 {role:'coordinator',label:'Coordinator',description:'Course allocations and reports',email:import.meta.env.VITE_DEMO_COORDINATOR_EMAIL || 'coordinator@example.test',password:import.meta.env.VITE_DEMO_COORDINATOR_PASSWORD || 'DemoCoordinator123!'},
 {role:'faculty',label:'Lecturer',description:'Personal courses and workload',email:import.meta.env.VITE_DEMO_LECTURER_EMAIL || 'lecturer@example.test',password:import.meta.env.VITE_DEMO_LECTURER_PASSWORD || 'DemoLecturer123!'},
];
