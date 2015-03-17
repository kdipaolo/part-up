Part-Up
=================

# Installation

- ensure [meteor](https://www.meteor.com/install) is installed
- `cd app`
- `meteor`

# Frontend
## Backend flow, regarding Collections

_This is just a mind dump of the current flow, k thx bye._

- Frontend uses `Meteor.call` to insert, update or remove documents in a collection.
- Backend checks if the logged in user is authorised to perform the given operation (inside a Meteor method).
- Backend emits an event that corresponds with the given CRUD operation, e.g. `insert, update or remove` (inside a Meteor method).
- Event handlers in the backend handle the given events, e.g. persistence to MongoDB or creation of user notifications.

## Structure
We have four types of application parts: *layout*, *page*, *widget* and *small component*. The explanation below points out their uses. Grahpic: **docs/frontend-structure.pdf**.

### Layout
Layouts are the top-level templates. They can contain a header, current page placeholder and footer. The Sass file should only contain header and footer positioning rules. The js file should keep track of the state of the template and handle navigation functionality.

### Page
Pages can contain single components with page-specific functionality, widgets (packages) and sub-pages. A page, in fact, only represents a composition. Therefore, the Sass file should only contain position defenitions of the inside components. The js file should handle the page states and navigation functionality if subpages are present. Pages are directly binded to routes.

### Widget (packages)
With a funcionality, you can think of a widget which will fulfill one standalone functionality. Functionalities that tie the app together (like a navigation bar) should not be declared as a package, because it’s not a widget with a standalone functionality. The Sass file may only contain component composition rules. When a widget is called WidgetsPartupActivities, the package should be called partup:client-widgets-partup-activities.

### Small component
The whole app is made up of small styled components. These components are not functional by themselves, but only provides styling. For example: buttons, inputs, titles, paragraphs and menus. Each component should be defined as a Sass class prefixed with “pu-”, for example “pu-button”. Be aware not to define any styling dealing with the position of the component inside its parent or relative to its siblings.


