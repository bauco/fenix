const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:5163';
const PROXY_CONFIG = [
  {
    context: [
      "/User/login",
    ],
    target,
    secure: false,
    changeOrigin: true,
  },
  {
    context: [
      "/User/signup",
    ],
    target,
    secure: false,
    changeOrigin: true,
  },
  {

    context: [
      "/User/refresh-token",
    ],
    target,
    secure: false,
    changeOrigin: true,
  },
  {
    context: [
      "/Search",
    ],
    target,
    secure: false,
    changeOrigin: true,
  },
  {
    context: [
      "/Bookmark",
    ],
    target,
    secure: false,
    changeOrigin: true,
  }
]

module.exports = PROXY_CONFIG;
