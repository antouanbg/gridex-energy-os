import config from './playwright.config';
export default {...config, use:{...config.use,baseURL:'http://127.0.0.1:4197'},
  webServer:{command:'npm run preview:pages -- --port 4197',url:'http://127.0.0.1:4197',reuseExistingServer:false}};
