Asiance-Basecamp-Crx
====================

Chrome extension for Basecamp based on the [new Basecamp API](https://github.com/37signals/bcx-api).

Features
--------------------

  - OAuth2 for authentification
  - Display Todos
  - Sort Todos by due date
  - Use badge as Todos counters
  - Notification on new Todo
  - Instant search through Todos

Tips for search todos
--------------------
<table>
  <tr>
    <th>Keyword</th>
    <th>Filters</th>
  </tr>
  <tr>
    <th>@someone</th>
    <td>Display current todos assigned to someone else</td>
  </tr>
  <tr>
    <th>:created</th>
    <td>Display todos I created</td>
  </tr>
</table>

Installation
--------------------

1. Visit `chrome://extension` or in Chrome menu, **Settings > Extensions**
2. Check **Developer Mode** in the top right-hand corner
3. Click **Load unpacked extension…**
4. Select the directory in which you unzip the extension files

Default configuration
--------------------

*  The extension is preconfigured to choose the **first** Basecamp account that matches `{"product": "bcx"}`. In `js/background.js` and `js/controller.js`:

        localStorage['basecampId'] = _.findWhere(data.accounts, {product: "bcx"}).id;

*  Refresh period is set in `js/background.js` to **five seconds**.

Settings
--------------------

  - Period refresh
  - Category to display on open
  - Languages (English, French, Italian, Japanese, Korean, Portuguese)
  - Scrollbar on/off
  - Logout

Dependencies
--------------------

  - [jQuery](http://jquery.com/)
  - [AngularJS](http://angularjs.org/)
  - [Underscore.js](http://underscorejs.org/g/)
  - [OAuth 2.0 library for Chrome Extensions](https://github.com/borismus/oauth2-extensions)

Authors
--------------------

  - [Laurent Le Graverend](https://github.com/laurent-le-graverend)
  - [Adrien Desbiaux](https://github.com/AdrienFromToulouse)
  - Antoine Blancher
  - [Gilles Piou](https://github.com/pioug)