// Public demonstration credentials only. Never configure real staff passwords here.
// Vite exposes VITE_* values to the browser. Production autofill requires explicit opt-in.
const enabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';
const preset = (key, email, password) => ({
 email: enabled ? (import.meta.env[`VITE_DEMO_${key}_EMAIL`] || email) : '',
 password: enabled ? (import.meta.env[`VITE_DEMO_${key}_PASSWORD`] || password) : '',
});
export const loginPresets = [
 {role:'admin',label:'Admin',description:'Users and academic management',...preset('ADMIN','Main@gmail.com','admin123!')},
 {role:'hod',label:'HOD',description:'Department planning and approvals',...preset('HOD','hod@example.test','DemoHod123!')},
 {role:'coordinator',label:'Coordinator',description:'Course allocations and reports',...preset('COORDINATOR','coordinator@example.test','DemoCoordinator123!')},
 {role:'faculty',label:'Lecturer',description:'Personal courses and workload',...preset('LECTURER','lecturer@example.test','DemoLecturer123!')},
];
export const demoLoginEnabled = enabled;
