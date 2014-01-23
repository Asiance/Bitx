Bitx - Basecamp to-dos extension
====================

Chrome extension based on the [last Basecamp API](https://github.com/37signals/bcx-api).

Features
--------------------

  - OAuth2 for authentification
  - Display todos of Basecamp projects
  - Sort todos by due date
  - Use badge as todos counters
  - Notification on new todo
  - Instant search through todos
  - Support multiple Basecamp accounts

Advanced filters for searching todos
--------------------
<table>
  <tr>
    <th>Keyword</th>
    <th>Filters</th>
  </tr>
  <tr>
    <th>to:</th>
    <td>Display current todos assigned to someone else</td>
  </tr>
  <tr>
    <th>from:</th>
    <td>Display todos someone created</td>
  </tr>
</table>

Installation
--------------------

### Basic: From the Chrome store ###
1. Visit the [Bitx page on the Chrome store](https://chrome.google.com/webstore/detail/bitx-basecamp-instant-to/jnijbmnaaacbkinjnakgemejkicfjfik)
2. Add to chrome
3. Rate the extension if you like it!

### Advanced: From GitHub ###
1. Download the package as a zip file
2. Visit `chrome://extension` or in Chrome menu, **Settings > Extensions**
3. Check **Developer Mode** in the top right-hand corner
4. Click **Load unpacked extension…**
5. Select the directory in which you unzip the extension files

Settings
--------------------

  - Refresh period
  - To-dos counter in the icon
  - Languages (English, French, Italian, Japanese, Korean, Portuguese)
  - Logout

Dependencies
--------------------

  - [AngularJS](http://angularjs.org/)
  - [jQuery](http://jquery.com/)
  - [jQuery UI](http://jqueryui.com/)
  - [Nicescroll ](https://github.com/inuyaksa/jquery.nicescroll)
  - [OAuth 2.0 library for Chrome Extensions](https://github.com/borismus/oauth2-extensions)
  - [Underscore.js](http://underscorejs.org/g/)

Credits
--------------------

  - Product Owner: [Laurent Le Graverend](https://github.com/laurent-le-graverend)
  - Scrum Master: [Adrien Desbiaux](https://github.com/AdrienFromToulouse)
  - Developer: [Gilles Piou](https://github.com/pioug)
  - UX/UI Designer: [Antoine Blancher](http://cargocollective.com/ablancher)

Licence (MIT)
--------------------
Copyright 2013 Asiance Korea ltd.  
http://www.asiance.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
