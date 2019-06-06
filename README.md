# Handlebars + Bootstrap Website Template
Basic template to start new static sites built on top of Handlebars and Bootstrap.

### Includes
 - Handlebars for lightweight templating
 - Bootstrap CSS framework
 - SCSS Lint, Preprocessing, and minification (sourcemaps, autoprefixer, clean-css)
 - JavaScript minification and bundling
 - Static distribution folder for rapid deployment
 - Configurable Gulp tasks

### Installation
Get started by installing: node, npm, and gulp (these are required).  Clone/fork the repo and run:

```sh
$ cd handlebars-boilerplate
$ npm install
$ npm start
```

### Development
Always edit files within the `/src/` folder.   Once the server is started, gulp will watch for file changes and automatically compile into the `/docs/` folder.  Any manual changes to `/docs/` will be lost.

Note: I'm pushing everything to a `/docs` folder for cleaner URL's on GitHub Pages.