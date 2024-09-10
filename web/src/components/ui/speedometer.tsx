import React, { useEffect, useMemo, useRef } from "react";

interface SpeedometerProps {
    speed: number;
    maxRpm: number;
    rpm: number;
    gears: number;
}

const Speedometer: React.FC<SpeedometerProps> = React.memo(
    function Speedometer({ speed = 42, maxRpm = 100, rpm = 20, gears = 8 }) {
        const percentage = useMemo(() => (rpm / maxRpm) * 100, [rpm, maxRpm]);
        const activeArcRef = useRef<SVGPathElement>(null);

        const polarToCartesian = (
            centerX: number,
            centerY: number,
            radius: number,
            angleInDegrees: number
        ) => {
            const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
            return {
                x: centerX + radius * Math.cos(angleInRadians),
                y: centerY + radius * Math.sin(angleInRadians),
            };
        };

        const createArc = useMemo(
            () =>
                (
                    x: number,
                    y: number,
                    radius: number,
                    startAngle: number,
                    endAngle: number
                ) => {
                    const start = polarToCartesian(x, y, radius, startAngle);
                    const end = polarToCartesian(x, y, radius, endAngle);
                    const largeArcFlag =
                        endAngle - startAngle <= 180 ? "0" : "1";
                    return [
                        "M",
                        start.x,
                        start.y,
                        "A",
                        radius,
                        radius,
                        0,
                        largeArcFlag,
                        1,
                        end.x,
                        end.y,
                    ].join(" ");
                },
            []
        );

        const createGearLine = useMemo(
            () =>
                (
                    centerX: number,
                    centerY: number,
                    innerRadius: number,
                    outerRadius: number,
                    angle: number
                ) => {
                    const inner = polarToCartesian(
                        centerX,
                        centerY,
                        innerRadius,
                        angle
                    );
                    const outer = polarToCartesian(
                        centerX,
                        centerY,
                        outerRadius,
                        angle
                    );
                    return `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`;
                },
            []
        );

        useEffect(() => {
            if (activeArcRef.current) {
                const length = activeArcRef.current.getTotalLength();
                const offset = length * (1 - percentage / 100);
                activeArcRef.current.style.strokeDasharray = `${length} ${length}`;
                activeArcRef.current.style.strokeDashoffset = `${offset}`;
            }
        }, [percentage]);

        const gearLines = useMemo(
            () =>
                [...Array(gears)].map((_, i) => {
                    const angle = -120 + (i * 240) / (gears - 1);
                    return (
                        <g key={`gear-${i}`}>
                            <path
                                d={createGearLine(0, 0, 34, 38, angle)}
                                stroke="#ffffff"
                                strokeWidth="0.7"
                                opacity="0.7"
                            />
                        </g>
                    );
                }),
            [gears, createGearLine]
        );

        return (
            <div className="w-60 h-64 relative flex items-center justify-center -mb-20 z-0 -skew-x-[4deg]">
                <svg
                    viewBox="-50 -50 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full"
                >
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur
                                stdDeviation="2.5"
                                result="coloredBlur"
                            />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <g filter="url(#glow)">
                        <path
                            d={createArc(0, 0, 40, -120, 120)}
                            fill="none"
                            stroke="#11181a27"
                            strokeWidth="5"
                        />
                        <path
                            ref={activeArcRef}
                            d={createArc(0, 0, 40, -120, 120)}
                            fill="none"
                            strokeWidth="5"
                            className={`transition-all duration-300 ease-in-out ${
                                percentage >= 80
                                    ? "stroke-red-600"
                                    : percentage >= 50
                                    ? "stroke-yellow-500"
                                    : "stroke-primary"
                            }`}
                        />
                    </g>
                    {gearLines}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center -skew-x-[10deg]">
                    <div className="text-center flex flex-col">
                        <span className="text-4xl font-bold text-white tabular-nums">
                            {speed}
                        </span>
                        <span className="text-xl -mt-1 font-semibold text-gray-400">
                            MPH
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);

export default Speedometer;
