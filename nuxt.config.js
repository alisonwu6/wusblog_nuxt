const pkg = require('./package');
const bodyParser = require('body-parser');
const axios = require('axios');

export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: 'Frontend Candidate Wu',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Blog of a Frontend developer in Taiwan' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff', duration: 5000, height: '4px' },
  loadingIndicator: {
    name: 'circle',
    color: 'rgba(59, 130, 246)'
  },
  /*
   ** Global CSS
   */
  css: [
    '~assets/css/tailwind.css'
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~plugins/vuelidate.js',
    '~plugins/core-components.js',
    '~plugins/date-filter.js'
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxtjs/tailwindcss',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
  ],
  axios: {
    baseURL: process.env.BASE_URL || 'https://nuxt-porfolio-app-default-rtdb.firebaseio.com',
    credentials: false
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) { },
  },
  transition: {
    name: 'fade',
    mode: 'out-in'
  },
  env: {
    //   baseUrl: process.env.BASE_URL || 'https://nuxt-porfolio-app-default-rtdb.firebaseio.com'
    fbAPIKey: 'AIzaSyD9ELsal8bh419_ZWhgijPKY78nExAky4Y',
  },
  // router: {
  //   middleware: 'log'
  // }
  serverMiddleware: [
    bodyParser.json(),
    '~/api',
  ],
  generate: {
    routes: function () {
      axios.get('https://nuxt-porfolio-app-default-rtdb.firebaseio.com/posts')
        .then(res => {
          const routes = [];
          for (const key in res.data) {
            routes.push('/posts/' + key);
          }
          return routes;
        })
    }
  }
};
