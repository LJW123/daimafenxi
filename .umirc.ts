

import { defineConfig } from 'umi';
import { PUBLIC_PATH } from './src/config';

export default defineConfig({
  publicPath: `${PUBLIC_PATH}`, // 资源访问路径，默认/
  npmClient: 'yarn',
  hash: true,
  jsMinifier: 'terser',
  history: {
    type: 'hash',
  },
  links: [
    { href: `${PUBLIC_PATH}favicon.ico`, rel: 'shortcut icon' },
    { href: `${PUBLIC_PATH}maps/v2/map.css`, rel: 'stylesheet' },
    {
      href: `${PUBLIC_PATH}maps/compare/compare.css`,
      rel: 'stylesheet',
    },
  ],
  headScripts: [
    { src: `${PUBLIC_PATH}qConf.js` },
    { src: `${PUBLIC_PATH}maps/v2/map.js` },
    { src: `${PUBLIC_PATH}maps/compare/compare.js` },
    { src: `${PUBLIC_PATH}threejs/three146.js` },
    { src: `${PUBLIC_PATH}maps/wind-gl.js` },
    { src: `${PUBLIC_PATH}plug_in/handlebars.js` }, 

    {
      content: `
        window.QMapboxGl = window.mapboxgl;
        delete window.mapboxgl;
        `,
    },

  ],
  routes: [
    {
      path: '/login',
      component: '@/pages/login/index.tsx',
    },
    {
      path: '/zzz',
      component: '@/pages/zzz/index.tsx',
    },
    {
      path: '/',
      component: '@/layouts/Layouts.tsx',
      routes: [

        {
          path: '/index',
          component: '@/pages/home/index.tsx',
        },
        {
          path: '/history',
          component: '@/pages/history/index.tsx',
        },
        {
          path: '/runrecord',
          component: '@/pages/runRecord/index.tsx',
        },
      ],
    },
  ],
});
