const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'tests',testMatch:'*.spec.cjs',workers:1,use:{headless:true},webServer:{command:'python -m http.server 8832 --bind 127.0.0.1',url:'http://127.0.0.1:8832',reuseExistingServer:!process.env.CI},reporter:'list'});
