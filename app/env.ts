// you have to define type of AppLoadContext here if you pass something from server.ts to your app
declare module "react-router" {
  // Your AppLoadContext used in v2
  interface AppLoadContext {}
}

export {}; // necessary for TS to treat this as a module
