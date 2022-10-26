# SENSE-spaces-webapp-csit321
This project aims to provide a web accessible application that will allow users to plan and visualise a multi-sensory environment within a user-defined space. The app will have a baseline set of equipment that is available by default, and also have the capability to import specific equipment if a user has something more suited to their needs. 

## Deployment available on GitHub pages
https://nmonteleone1.github.io/SENSE-spaces-webapp-csit321/

## Application Usage
### Left Panel
- New Room
  - Brings up a form for Room Generation
- Import Room
  - Import .JSON file previously exported to a local machine.
- Export Room
  - Export current room into either a .JSON file for importing in the future, or a .JPG for a viewing reference.
- User Settings
  - Shows options for the user to increase accessibility.
  - Dropdown options for Font Size and Text Spacing that affect all text on the application.
  - Highlight toggles for Buttons and Links to provide viewing highlights for all interactable objects on the application.
  - Automatically saves between sessions.

### Right Panel
- Create a new object
  - Brings up a form to input a generic 3D object in the space.
- Import an existing object
  - Brings up a form to input dimensions and file input for a user sourced 3D model (.obj format)
- Choose an object from the predefined set
  - Shows a list of sensory categories which can be expanded into client provided objects
  - Expanded categories show all objects that target the chosen sense
  - Each object can be added to the 3D space, and have further information shown about it
- Object Properties
  - Only shows on object selection in the 3D space
  - Scale function to change the size of selected object
  - List of buttons to manipulate the object in 3D space, including movement and rotation
  - Button to remove the object from 3D space

### On-screen buttons
- Zoom in / Zoom out
- Move camera up / down / left / right
- Rotate camera up / down / left / right

### 3D Space
- Left click and drag to rotate the camera
- Right click and drag to move the camera
- Scroll in or scroll out to zoom the camera
- Left click an object to 'select' it
  - Brings up the Object Properties menu on the right side
  - Click and drag to move the object in the 3D space
  - Scroll while hovering on a selected object to rotate the object
  - Left click off the object to 'deselect' it
