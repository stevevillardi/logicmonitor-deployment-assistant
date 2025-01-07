import React, { useState, useRef } from 'react';
import Image from 'next/image';

const ORIGINAL_WIDTH = 1200; // Match this to your image's actual width

export const CoordinateHelper = () => {
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    const getCoordinates = (e: React.MouseEvent) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const scale = rect.width / ORIGINAL_WIDTH;
        const x = Math.round((e.clientX - rect.left) / scale);
        const y = Math.round((e.clientY - rect.top) / scale);
        return { x, y };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const coords = getCoordinates(e);
        if (coords) setStartPos(coords);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const coords = getCoordinates(e);
        if (coords) setCurrentPos(coords);
    };

    const handleMouseUp = () => {
        if (startPos && currentPos) {
            const width = Math.abs(currentPos.x - startPos.x);
            const height = Math.abs(currentPos.y - startPos.y);
            const x = Math.min(startPos.x, currentPos.x);
            const y = Math.min(startPos.y, currentPos.y);
            
            console.log(`Coordinates: { x: ${x}, y: ${y}, width: ${width}, height: ${height} }`);
        }
        setStartPos(null);
    };

    return (
        <div className="relative border rounded-lg overflow-hidden">
            <div 
                ref={imageRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setStartPos(null)}
                className="relative cursor-crosshair"
            >
                <Image 
                    src="/platform-diagram.png" 
                    alt="LogicMonitor Platform Architecture"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                />
                
                {/* Show current coordinates */}
                {currentPos && (
                    <div className="absolute top-0 left-0 bg-black/75 text-white px-2 py-1 text-sm">
                        x: {currentPos.x}, y: {currentPos.y}
                    </div>
                )}

                {/* Show selection box */}
                {startPos && currentPos && (
                    <div 
                        className="absolute border-2 border-blue-500 bg-blue-500/20"
                        style={{
                            left: Math.min(startPos.x, currentPos.x),
                            top: Math.min(startPos.y, currentPos.y),
                            width: Math.abs(currentPos.x - startPos.x),
                            height: Math.abs(currentPos.y - startPos.y),
                        }}
                    />
                )}
            </div>
        </div>
    );
}; 