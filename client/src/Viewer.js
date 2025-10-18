import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Grid, Html, DragControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import useStore from './store';

function DraggableElement({ element, onDragStart, onDragEnd }) {
  const { moveElement, selectElement, validatePosition, snapPosition, getAlignmentGuides, selectedElement } = useStore();
  const meshRef = useRef();
  const [alignmentGuides, setAlignmentGuides] = useState([]);

  const handleDrag = (event) => {
    if (event.object) {
      let newPosition = [event.object.position.x, event.object.position.y, event.object.position.z];

      // Apply snapping
      newPosition = snapPosition(newPosition);

      // Get alignment guides
      const guides = getAlignmentGuides(element.id, newPosition);
      setAlignmentGuides(guides);

      if (validatePosition(element.id, newPosition)) {
        moveElement(element.id, newPosition);
      } else {
        // Reset to original position if invalid
        event.object.position.set(...element.position);
      }
    }
  };

  const rotation = element.rotation || [0, 0, 0];
  const isOpen = element.isOpen || false;

  // For door opening, rotate around Y axis
  const doorRotation = isOpen ? [0, Math.PI / 2, 0] : rotation;

  // Create material based on type and material
  const getMaterial = () => {
    const materialProps = {
      color: element.color,
      roughness: 0.7,
      metalness: element.material === 'metal' ? 0.8 : 0.1,
    };

    if (element.material === 'glass') {
      materialProps.transparent = true;
      materialProps.opacity = 0.7;
      materialProps.roughness = 0.1;
      materialProps.metalness = 0.0;
    }

    return <meshStandardMaterial {...materialProps} />;
  };

  const isSelected = element.id === selectedElement;

  return (
    <group>
      {isSelected && (
        <DragControls
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDrag={handleDrag}
        >
          <Box
            ref={meshRef}
            args={element.size}
            position={element.position}
            rotation={element.type === 'door' ? doorRotation : rotation}
            onClick={() => selectElement(element.id)}
            castShadow
            receiveShadow
          >
            {getMaterial()}
          </Box>
        </DragControls>
      )}
      {!isSelected && (
        <Box
          ref={meshRef}
          args={element.size}
          position={element.position}
          rotation={element.type === 'door' ? doorRotation : rotation}
          onClick={() => selectElement(element.id)}
          castShadow
          receiveShadow
        >
          {getMaterial()}
        </Box>
      )}
      {/* Render alignment guides if this element is selected */}
      {isSelected && alignmentGuides.map((guide, index) => (
        <AlignmentGuide key={index} guide={guide} />
      ))}
    </group>
  );
}

function AlignmentGuide({ guide }) {
  const { container } = useStore();

  if (guide.axis === 'x') {
    return (
      <Box
        args={[0.01, container.height, container.width]}
        position={[guide.value, container.height / 2, 0]}
      >
        <meshBasicMaterial color={guide.type === 'wall' ? '#ff0000' : '#00ff00'} transparent opacity={0.5} />
      </Box>
    );
  } else if (guide.axis === 'z') {
    return (
      <Box
        args={[container.length, container.height, 0.01]}
        position={[0, container.height / 2, guide.value]}
      >
        <meshBasicMaterial color={guide.type === 'wall' ? '#ff0000' : '#00ff00'} transparent opacity={0.5} />
      </Box>
    );
  } else if (guide.axis === 'y') {
    return (
      <Plane
        args={[container.length, container.width]}
        position={[0, guide.value, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color={guide.type === 'floor' ? '#0000ff' : '#00ff00'} transparent opacity={0.3} />
      </Plane>
    );
  }

  return null;
}

function Container({ onDragStart, onDragEnd }) {
  const { container, elements } = useStore();

  return (
    <group>
      {/* Grid for better depth perception */}
      <Grid args={[container.length, container.width]} position={[0, 0.01, 0]} />
      {/* Container walls with reduced thickness for better visibility */}
      <Box args={[container.length, container.height, 0.05]} position={[0, container.height / 2, container.width / 2]}>
        <meshStandardMaterial color="#c0c0c0" roughness={0.8} metalness={0.1} />
      </Box>
      <Box args={[container.length, container.height, 0.05]} position={[0, container.height / 2, -container.width / 2]}>
        <meshStandardMaterial color="#c0c0c0" roughness={0.8} metalness={0.1} />
      </Box>
      <Box args={[0.05, container.height, container.width]} position={[container.length / 2, container.height / 2, 0]}>
        <meshStandardMaterial color="#c0c0c0" roughness={0.8} metalness={0.1} />
      </Box>
      <Box args={[0.05, container.height, container.width]} position={[-container.length / 2, container.height / 2, 0]}>
        <meshStandardMaterial color="#c0c0c0" roughness={0.8} metalness={0.1} />
      </Box>
      {/* Floor */}
      <Plane args={[container.length, container.width]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} metalness={0.0} />
      </Plane>
      {/* Roof */}
      <Plane args={[container.length, container.width]} rotation={[Math.PI / 2, 0, 0]} position={[0, container.height, 0]}>
        <meshStandardMaterial color="#d0d0d0" roughness={0.7} metalness={0.2} />
      </Plane>
      {/* Render draggable elements */}
      {elements.map(el => (
        <DraggableElement
          key={el.id}
          element={el}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </group>
  );
}

function Viewer() {
  const [dragging, setDragging] = useState(false);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          <Container onDragStart={() => setDragging(true)} onDragEnd={() => setDragging(false)} />
          <OrbitControls enablePan={!dragging} enableZoom={!dragging} enableRotate={!dragging} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Viewer;
