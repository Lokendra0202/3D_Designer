import { create } from 'zustand';

const useStore = create((set, get) => ({
  container: { length: 6, width: 2.5, height: 3, material: 'metal' }, // Default container dimensions and material
  elements: [], // Array of design elements: { id, type, position, size, material, color }
  selectedElement: null,
  materials: ['wood', 'metal', 'plastic', 'glass', 'concrete', 'fabric'],
  colors: ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff'],
  snapToGrid: true,
  gridSize: 0.1,
  snapToRotation: false,
  rotationSnapAngle: Math.PI / 2, // 90 degrees

  setContainerDimensions: (dimensions) => set((state) => ({ container: { ...state.container, ...dimensions } })),

  setContainerMaterial: (material) => set((state) => ({ container: { ...state.container, material } })),

  addElement: (element) => set((state) => ({
    elements: [...state.elements, { ...element, id: Date.now(), rotation: [0, 0, 0], isOpen: false }]
  })),

  removeElement: (id) => set((state) => ({
    elements: state.elements.filter(el => el.id !== id)
  })),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map(el => el.id === id ? { ...el, ...updates } : el)
  })),

  selectElement: (id) => set({ selectedElement: id }),

  moveElement: (id, position) => set((state) => ({
    elements: state.elements.map(el => el.id === id ? { ...el, position } : el)
  })),

  exportDesign: () => {
    const state = get();
    return JSON.stringify({ container: state.container, elements: state.elements }, null, 2);
  },

  validatePosition: (id, newPosition) => {
    const state = get();
    const element = state.elements.find(el => el.id === id);
    if (!element) return false;

    const { container } = state;
    const halfLength = container.length / 2;
    const halfWidth = container.width / 2;
    const halfHeight = container.height / 2;

    // Check bounds: element should not go outside container (accounting for element size)
    const margin = 0.05; // Small margin for walls
    if (
      newPosition[0] - element.size[0]/2 < -halfLength + margin ||
      newPosition[0] + element.size[0]/2 > halfLength - margin ||
      newPosition[1] - element.size[1]/2 < 0 + margin ||
      newPosition[1] + element.size[1]/2 > halfHeight - margin ||
      newPosition[2] - element.size[2]/2 < -halfWidth + margin ||
      newPosition[2] + element.size[2]/2 > halfWidth - margin
    ) {
      return false;
    }

    // Check for collisions with other elements
    for (const other of state.elements) {
      if (other.id === id) continue;
      if (
        Math.abs(newPosition[0] - other.position[0]) < (element.size[0] + other.size[0]) / 2 &&
        Math.abs(newPosition[1] - other.position[1]) < (element.size[1] + other.size[1]) / 2 &&
        Math.abs(newPosition[2] - other.position[2]) < (element.size[2] + other.size[2]) / 2
      ) {
        return false;
      }
    }

    return true;
  },

  validateRotation: (id, newRotation) => {
    const state = get();
    const element = state.elements.find(el => el.id === id);
    if (!element) return false;

    // Basic bounds check for all rotations: keep within -2π to 2π
    for (let i = 0; i < 3; i++) {
      if (newRotation[i] < -2 * Math.PI || newRotation[i] > 2 * Math.PI) return false;
    }

    // Special validation for doors: only allow Y-axis rotation for opening/closing
    if (element.type === 'door') {
      // For doors, X and Z should be 0, Y between 0 and π/2
      if (newRotation[0] !== 0 || newRotation[2] !== 0) return false;
      if (newRotation[1] < 0 || newRotation[1] > Math.PI / 2) return false;

      // Check if rotated door intersects with walls
      const { container } = state;
      const doorWidth = element.size[0];

      // When rotated 90 degrees, check if it fits
      if (Math.abs(newRotation[1] - Math.PI / 2) < 0.1) {
        const protrusion = doorWidth / 2;
        if (element.position[0] + protrusion > container.length / 2 - 0.05 ||
            element.position[0] - protrusion < -container.length / 2 + 0.05) {
          return false;
        }
      }
    }

    // For other elements, basic validation passed
    return true;
  },

  snapPosition: (position) => {
    const state = get();
    if (!state.snapToGrid) return position;

    return [
      Math.round(position[0] / state.gridSize) * state.gridSize,
      Math.round(position[1] / state.gridSize) * state.gridSize,
      Math.round(position[2] / state.gridSize) * state.gridSize
    ];
  },

  getAlignmentGuides: (id, position) => {
    const state = get();
    const element = state.elements.find(el => el.id === id);
    if (!element) return [];

    const guides = [];
    const { container } = state;

    // Wall alignment guides
    const wallThreshold = 0.1;
    if (Math.abs(position[0] - (container.length / 2 - element.size[0]/2)) < wallThreshold) {
      guides.push({ axis: 'x', value: container.length / 2 - element.size[0]/2, type: 'wall' });
    }
    if (Math.abs(position[0] - (-container.length / 2 + element.size[0]/2)) < wallThreshold) {
      guides.push({ axis: 'x', value: -container.length / 2 + element.size[0]/2, type: 'wall' });
    }
    if (Math.abs(position[2] - (container.width / 2 - element.size[2]/2)) < wallThreshold) {
      guides.push({ axis: 'z', value: container.width / 2 - element.size[2]/2, type: 'wall' });
    }
    if (Math.abs(position[2] - (-container.width / 2 + element.size[2]/2)) < wallThreshold) {
      guides.push({ axis: 'z', value: -container.width / 2 + element.size[2]/2, type: 'wall' });
    }
    if (Math.abs(position[1] - element.size[1]/2) < wallThreshold) {
      guides.push({ axis: 'y', value: element.size[1]/2, type: 'floor' });
    }

    // Element alignment guides
    for (const other of state.elements) {
      if (other.id === id) continue;

      // Horizontal alignment
      if (Math.abs(position[0] - other.position[0]) < wallThreshold) {
        guides.push({ axis: 'x', value: other.position[0], type: 'element' });
      }
      // Vertical alignment
      if (Math.abs(position[1] - other.position[1]) < wallThreshold) {
        guides.push({ axis: 'y', value: other.position[1], type: 'element' });
      }
      // Depth alignment
      if (Math.abs(position[2] - other.position[2]) < wallThreshold) {
        guides.push({ axis: 'z', value: other.position[2], type: 'element' });
      }
    }

    return guides;
  },

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  setGridSize: (size) => set({ gridSize: size }),

  snapRotation: (rotation) => {
    const state = get();
    if (!state.snapToRotation) return rotation;

    return [
      Math.round(rotation[0] / state.rotationSnapAngle) * state.rotationSnapAngle,
      Math.round(rotation[1] / state.rotationSnapAngle) * state.rotationSnapAngle,
      Math.round(rotation[2] / state.rotationSnapAngle) * state.rotationSnapAngle
    ];
  },

  toggleSnapToRotation: () => set((state) => ({ snapToRotation: !state.snapToRotation })),

  setRotationSnapAngle: (angle) => set({ rotationSnapAngle: angle })
}));

export default useStore;
