# Rotation Enhancements TODO

## 1. Add X and Z Rotation Inputs in ControlPanel
- [x] Add TextField for Rotation X in the Edit Selected Element card
- [x] Add TextField for Rotation Z in the Edit Selected Element card
- [x] Ensure inputs update the element's rotation array correctly

## 2. Implement Interactive Rotation Gizmos in Viewer
- [x] Import TransformControls from @react-three/drei
- [x] Add TransformControls component that activates on selected element
- [x] Set mode to 'rotate' for rotation gizmos
- [x] Handle onObjectChange to update element rotation in store
- [x] Disable OrbitControls when rotating to avoid conflicts

## 3. Add Rotation Presets/Snapping
- [x] Add buttons or dropdown for common rotation angles (0°, 90°, 180°, 270°)
- [x] Implement snapRotation function in store (similar to snapPosition)
- [x] Apply snapping when using gizmos or manual input
- [x] Add toggle for rotation snapping

## 4. Update Validation and Door Logic
- [x] Extend validateRotation to handle X and Z axes
- [x] Update door opening logic to work with custom rotations
- [x] Ensure rotated elements don't clip through walls or other elements

## 5. Testing and Refinement
- [ ] Test all rotation features in the 3D view
- [ ] Verify snapping works correctly
- [ ] Check performance with multiple elements
- [ ] Update UI for better usability if needed
