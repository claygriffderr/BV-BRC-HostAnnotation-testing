# Host Annotation curation app 
A web application (host-annotation-app) that supports the manual curation of GenBank host names imported into BV-BRC.

- Dependencies
  - **[Axios](https://axios-http.com)**: A promise-based HTTP Client for node.js and the browser 
  - **[capacitor](https://capacitorjs.com)**: Capacitor is an open source native runtime for building Web Native apps. Create cross-platform iOS, Android, and Progressive Web Apps with JavaScript, HTML, and CSS. 
  - **[DataTables](https://datatables.net)**: A JavaScript HTML table enhancing library. It is a highly flexible tool, built upon the foundations of progressive enhancement, that adds advanced features to any HTML table. 
  - **[ionic framework](https://ionicframework.com)**: An open source mobile UI toolkit for building modern, high quality cross-platform mobile apps from a single code base.
  - **[ionic icons](https://ionic.io/ionicons)**: Premium designed icons for use in web, iOS, Android, and desktop apps.
  - **[stencil](https://stenciljs.com)**: A library for building reusable, scalable component libraries.
  - **[sweetalert2](https://sweetalert2.github.io)**: A beautiful, responsive, customizable, accessible (WAI-ARIA) replacement for JavaScript's popup boxes.


## Installation

- Clone the repository into a local directory.
- Open a command window and navigate to the directory.
- Run `npm install` to download all dependencies into the `node_modules/` directory.
- Open `src\global\Settings.ts` and populate `webServiceBaseURL` with the default URL of the web application.
- Run `npm run build` to build the project.
- After resolving any build errors that were encountered, a development version of the project can be run locally using `npm run start`.
- To deploy the project on a webserver, create a zip file containing everything under the `www` directory, move it to the webserver and unzip the directory.


[Back](./README.md)