import router from "./src/routes/studentRoutes.js";
console.log("router stack:");
for (const layer of router.stack) {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(",");
    console.log(layer.route.path, methods);
  }
}
