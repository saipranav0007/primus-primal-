import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Rack } from '../../types';

interface Warehouse3DProps {
  racks: Rack[];
  selectedRack: Rack | null;
  onSelectRack: (rack: Rack) => void;
  isSimulating: boolean;
  simulationProgress: number;
  highlightedRackCode?: string;
}

// 3D Rack Mesh Component
const RackMesh: React.FC<{
  rack: Rack;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
}> = ({ rack, isSelected, isHighlighted, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return '#10B981'; // Emerald
      case 'LOW':
      case 'LOW_STOCK':
        return '#F59E0B'; // Amber
      case 'CRITICAL':
        return '#F97316'; // Orange
      case 'OUT_OF_STOCK':
        return '#EF4444'; // Red
      case 'ACTIVE_PICKING':
        return '#06B6D4'; // Cyan
      default:
        return '#10B981';
    }
  };

  const statusColor = getStatusColor(isHighlighted ? 'ACTIVE_PICKING' : rack.status);

  return (
    <group position={[rack.posX, rack.posY, rack.posZ]}>
      {/* Interactive Bounding Box */}
      <mesh
        position={[0, 2.1, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2.6, 4.2, 1.4]} />
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.6}
          metalness={0.4}
          transparent
          opacity={hovered ? 0.3 : 0.05}
        />
      </mesh>

      {/* Rack Metal Frame Uprights */}
      {[-1.2, 1.2].map((x, xi) =>
        [-0.6, 0.6].map((z, zi) => (
          <mesh key={`${xi}-${zi}`} position={[x, 2.1, z]}>
            <boxGeometry args={[0.08, 4.2, 0.08]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* 4 Shelf Tiers */}
      {[0.4, 1.5, 2.6, 3.7].map((y, yi) => (
        <group key={yi} position={[0, y, 0]}>
          {/* Metal Shelf Plate */}
          <mesh>
            <boxGeometry args={[2.5, 0.06, 1.3]} />
            <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Boxes / Pallets on Shelf */}
          {[-0.7, 0, 0.7].map((bx, bi) => {
            const hasItem = (yi + bi + (rack.totalUnits || 10)) % 4 !== 0;
            if (!hasItem) return null;
            return (
              <mesh key={bi} position={[bx, 0.25, 0]}>
                <boxGeometry args={[0.55, 0.45, 0.8]} />
                <meshStandardMaterial
                  color={statusColor}
                  roughness={0.5}
                  emissive={isHighlighted || isSelected ? statusColor : '#000000'}
                  emissiveIntensity={isHighlighted || isSelected ? 0.6 : 0.05}
                />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Top Status Light Bar */}
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[2.5, 0.12, 0.12]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={hovered || isSelected || isHighlighted ? 1.2 : 0.5}
        />
      </mesh>

      {/* Rack Code Label */}
      <Text
        position={[0, 4.6, 0]}
        fontSize={0.45}
        color={isSelected ? '#38BDF8' : '#F8FAFC'}
        anchorX="center"
        anchorY="middle"
      >
        {rack.code}
      </Text>

      {/* Hover Info Tooltip (HTML overlay in 3D) */}
      {hovered && (
        <Html position={[0, 3.2, 0]} center distanceFactor={15}>
          <div className="bg-[#0B0F19]/95 border border-cyan-500/50 p-2.5 rounded-lg shadow-2xl backdrop-blur-md text-white text-xs w-44 pointer-events-none select-none z-50">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
              <span className="font-bold text-cyan-400 font-mono">RACK {rack.code}</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold"
                style={{ backgroundColor: `${statusColor}25`, color: statusColor }}
              >
                {rack.status}
              </span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-300">
              <p>Units: <b className="font-mono text-white">{rack.totalUnits || 38}</b></p>
              <p>Available: <b className="font-mono text-emerald-400">{rack.totalAvailable || 32}</b></p>
              <p>Reserved: <b className="font-mono text-amber-400">{rack.totalReserved || 6}</b></p>
            </div>
            <p className="text-[9px] text-cyan-300 mt-1.5 italic">Click rack to inspect inventory</p>
          </div>
        </Html>
      )}

      {/* Selection Glow Cylinder */}
      {(isSelected || isHighlighted) && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[1.8, 1.8, 0.05, 32]} />
          <meshStandardMaterial
            color={isHighlighted ? '#06B6D4' : '#38BDF8'}
            emissive={isHighlighted ? '#06B6D4' : '#38BDF8'}
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
};

// Animated 3D Worker / Picker Avatar
const PickerAvatar: React.FC<{ progress: number; isSimulating: boolean }> = ({ progress, isSimulating }) => {
  const meshRef = useRef<THREE.Group>(null);

  const waypoints = [
    new THREE.Vector3(0, 0, -15),   // Packing Bay P01
    new THREE.Vector3(-12, 0, -8),  // Rack A01
    new THREE.Vector3(-2, 0, -2),   // Rack B02
    new THREE.Vector3(8, 0, 4),     // Rack C03
    new THREE.Vector3(0, 0, -15),   // Return to Packing Bay
  ];

  const curve = new THREE.CatmullRomCurve3(waypoints, false);

  useFrame(() => {
    if (meshRef.current) {
      const t = progress % 1;
      const point = curve.getPoint(t);
      meshRef.current.position.copy(point);

      const tangent = curve.getTangent(t);
      meshRef.current.rotation.y = Math.atan2(tangent.x, tangent.z);
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, -15]}>
      {/* Picker Body */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#06B6D4" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Picker Safety Vest */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.5, 16]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.4} />
      </mesh>

      {/* Head & Helmet */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#FBBF24" metalness={0.7} />
      </mesh>

      {/* Picker Trolley / Cart */}
      <mesh position={[0, 0.4, 0.7]}>
        <boxGeometry args={[0.7, 0.5, 0.9]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>

      {/* Cart Boxes */}
      <mesh position={[0, 0.75, 0.7]}>
        <boxGeometry args={[0.5, 0.3, 0.6]} />
        <meshStandardMaterial color="#E2E8F0" />
      </mesh>

      {/* Beacon Light */}
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={1.5} />
      </mesh>

      {/* Picker Tag */}
      <Html position={[0, 2.3, 0]} center distanceFactor={12}>
        <div className="bg-cyan-950/90 border border-cyan-500 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-lg">
          PICKER: Aarav Sharma (Active)
        </div>
      </Html>
    </group>
  );
};

export const Warehouse3D: React.FC<Warehouse3DProps> = ({
  racks,
  selectedRack,
  onSelectRack,
  isSimulating,
  simulationProgress,
  highlightedRackCode,
}) => {
  const routePoints: [number, number, number][] = [
    [0, 0.1, -15],
    [-12, 0.1, -8],
    [-2, 0.1, -2],
    [8, 0.1, 4],
    [0, 0.1, -15],
  ];

  return (
    <div className="w-full h-full relative bg-[#080C14] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <Canvas
        camera={{ position: [0, 25, 24], fov: 45 }}
        shadows
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#080C14']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[15, 30, 15]} intensity={1.2} castShadow />
        <pointLight position={[0, 15, 0]} intensity={0.8} color="#06B6D4" distance={50} />

        {/* Orbit Controls */}
        <OrbitControls
          maxPolarAngle={Math.PI / 2.1}
          minDistance={8}
          maxDistance={60}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Warehouse Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 45]} />
          <meshStandardMaterial color="#0A0F1D" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Floor Grid Markings */}
        <gridHelper args={[50, 50, '#1E293B', '#0F172A']} position={[0, 0.01, 0]} />

        {/* Zone Boundaries & Labels */}
        <group position={[0, 0.02, 0]}>
          <Text position={[-9.5, 0.05, 9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.2} color="#06B6D4" fillOpacity={0.4}>
            ZONE A — HIGH VELOCITY
          </Text>

          <Text position={[0.5, 0.05, 9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.2} color="#3B82F6" fillOpacity={0.4}>
            ZONE B — AUDIO & HARDWARE
          </Text>

          <Text position={[10.5, 0.05, 9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.2} color="#10B981" fillOpacity={0.4}>
            ZONE C — WEARABLES & SMART
          </Text>

          {/* Packing Bay Marking */}
          <mesh position={[0, 0.05, -15]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[14, 6]} />
            <meshStandardMaterial color="#F59E0B" transparent opacity={0.15} />
          </mesh>
          <Text position={[0, 0.06, -15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.1} color="#F59E0B">
            PACKING & QC BAYS (P01 – P05)
          </Text>

          {/* Loading Dock / Dispatch Marking */}
          <mesh position={[0, 0.05, -20]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 3]} />
            <meshStandardMaterial color="#EC4899" transparent opacity={0.15} />
          </mesh>
          <Text position={[0, 0.06, -20]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.0} color="#EC4899">
            CARRIER DISPATCH DOCK BAY
          </Text>
        </group>

        {/* 3D Racks */}
        {racks.map((rack) => (
          <RackMesh
            key={rack.id || rack.code}
            rack={rack}
            isSelected={selectedRack?.code === rack.code}
            isHighlighted={highlightedRackCode === rack.code}
            onSelect={() => onSelectRack(rack)}
          />
        ))}

        {/* 3D Route Line using Drei Line */}
        <Line
          points={routePoints}
          color={isSimulating ? '#06B6D4' : '#334155'}
          lineWidth={2.5}
          transparent
          opacity={0.8}
        />

        {/* 3D Picker Avatar Simulation */}
        <PickerAvatar progress={simulationProgress} isSimulating={isSimulating} />
      </Canvas>
    </div>
  );
};
