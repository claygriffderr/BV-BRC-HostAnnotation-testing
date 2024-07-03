# BV-BRC-HostAnnotation

The BV-BRC Host Annotation project has several components:

## Host Annotation curation app 
A web application (host-annotation-app) that supports the manual curation of GenBank host names imported into BV-BRC.

- Dependencies
  - **[Axios](https://axios-http.com)**: A promise-based HTTP Client for node.js and the browser 
  - **[capacitor](https://capacitorjs.com)**: Capacitor is an open source native runtime for building Web Native apps. Create cross-platform iOS, Android, and Progressive Web Apps with JavaScript, HTML, and CSS. 
  - **[DataTables](https://datatables.net)**: A JavaScript HTML table enhancing library. It is a highly flexible tool, built upon the foundations of progressive enhancement, that adds advanced features to any HTML table. 
  - **[ionic framework](https://ionicframework.com)**: An open source mobile UI toolkit for building modern, high quality cross-platform mobile apps from a single code base.
  - **[ionic icons](https://ionic.io/ionicons)**: Premium designed icons for use in web, iOS, Android, and desktop apps.
  - **[stencil](https://stenciljs.com)**: A library for building reusable, scalable component libraries.
  - **[sweetalert2](https://sweetalert2.github.io)**: A beautiful, responsive, customizable, accessible (WAI-ARIA) replacement for JavaScript's popup boxes.

## Host Annotation Web API
A Web API (HostAnnotationWeb) that provides web services to the web application and command-line tools.
- Dependencies
  - **[.NET 8.0](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview)**
  - **Microsoft SQL Server 16.0**

## Host Annotation Library
A class library / DLL used by the Web API.
- Dependencies
  - **[.NET 8.0](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/overview)**
  - **[BCrypt.Net](https://www.nuget.org/packages/BCrypt.Net-Next)**: A port of jBCrypt implemented in C#, using a variant of the Blowfish 
	encryption algorithm’s keying schedule. 
  - **[jose-jwt](https://github.com/dvsekhvalnov/jose-jwt)**: Javascript Object Signing and Encryption (JOSE), JSON Web Token (JWT), JSON Web Encryption (JWE) and JSON Web Key (JWK) Implementation for .NET. Full suite of signature and encryption algorithms.

## Python client
Example Python code that demonstrates how to use the Web API from a command-line tool.

- Dependencies
  - **Python 3**
  - **[marshmallow](https://marshmallow.readthedocs.io/en/stable)**: An ORM/ODM/framework-agnostic library for converting complex datatypes, such as objects, to and from native Python datatypes.
  - **[pprint](https://docs.python.org/3/library/pprint.html)**: A module that provides a capability to “pretty-print” arbitrary Python data structures in a form which can be used as input to the interpreter.
  - **[typing](https://docs.python.org/3/library/typing.html)**: Provides runtime support for type hints.