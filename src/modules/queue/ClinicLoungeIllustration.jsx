import React from 'react';

/**
 * Beautiful vector illustration of clinic waiting lounge:
 * - Room 1 clinic door with label sign
 * - Indoor potted plant on the left
 * - Waiting lounge bench/sofa with two patients waiting
 */
export function ClinicLoungeIllustration({ className = 'w-48 sm:w-56 h-auto shrink-0' }) {
  return (
    <svg
      viewBox="0 0 240 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Clinic waiting lounge illustration"
    >
      {/* Background soft shadow/floor */}
      <ellipse cx="120" cy="132" rx="110" ry="6" fill="#E2EBF0" opacity="0.7" />

      {/* Potted Plant (Left) */}
      <g id="plant">
        {/* Pot */}
        <path d="M22 108 L26 130 H36 L40 108 Z" fill="#E08A68" />
        <path d="M20 105 H42 V108 H20 Z" fill="#D37855" rx="1.5" />
        {/* Plant Stems and Leaves */}
        <path d="M31 106 Q31 82 20 74 Q28 88 31 106" fill="#3D9970" />
        <path d="M31 104 Q33 70 38 62 Q38 80 32 104" fill="#2E7D5A" />
        <path d="M31 105 Q36 84 46 78 Q39 92 31 105" fill="#48B383" />
        <path d="M31 95 Q22 84 14 86 Q22 96 31 95" fill="#58C494" />
        <path d="M31 92 Q42 82 48 85 Q39 96 31 92" fill="#3D9970" />
      </g>

      {/* Waiting Lounge Bench / Sofa */}
      <g id="sofa">
        {/* Sofa legs */}
        <line x1="72" y1="124" x2="68" y2="132" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="140" y1="124" x2="144" y2="132" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Sofa base */}
        <rect x="64" y="112" width="84" height="13" rx="4" fill="#6BA3C8" />
        <rect x="66" y="114" width="39" height="9" rx="2.5" fill="#5A94BA" />
        <rect x="107" y="114" width="39" height="9" rx="2.5" fill="#5A94BA" />

        {/* Sofa backrest */}
        <rect x="66" y="86" width="80" height="28" rx="5" fill="#7DB4D8" />
        <rect x="69" y="88" width="36" height="23" rx="3" fill="#6BA3C8" />
        <rect x="107" y="88" width="36" height="23" rx="3" fill="#6BA3C8" />
      </g>

      {/* Patient 1 (Left - Male in Blue shirt) */}
      <g id="patient-male">
        {/* Head */}
        <ellipse cx="86" cy="62" rx="6.5" ry="7.5" fill="#E6BA95" />
        {/* Hair */}
        <path d="M79 61 C79 53 93 53 93 61 C91 55 83 55 79 61 Z" fill="#2C3437" />
        {/* Body/Shirt */}
        <path d="M78 72 C78 68 94 68 94 72 L96 98 H76 L78 72 Z" fill="#3B82F6" />
        {/* Collar */}
        <path d="M83 70 L86 75 L89 70 Z" fill="#DBEAFE" />
        {/* Arms resting on lap */}
        <path d="M76 76 Q72 88 80 92 Q88 92 88 92" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M96 76 Q100 88 92 92" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Pants */}
        <rect x="79" y="98" width="7" height="24" rx="2" fill="#1E293B" />
        <rect x="87" y="98" width="7" height="24" rx="2" fill="#1E293B" />
        {/* Shoes */}
        <ellipse cx="82" cy="123" rx="4.5" ry="2.5" fill="#0F172A" />
        <ellipse cx="91" cy="123" rx="4.5" ry="2.5" fill="#0F172A" />
      </g>

      {/* Patient 2 (Right - Female in Teal/Green dress) */}
      <g id="patient-female">
        {/* Hair back */}
        <path d="M120 58 C116 58 114 74 114 76 C118 78 132 78 136 76 C136 74 134 58 125 58 Z" fill="#1E1E24" />
        {/* Head */}
        <ellipse cx="125" cy="63" rx="6" ry="7" fill="#ECC5A8" />
        {/* Hair bangs */}
        <path d="M119 61 C121 54 130 54 132 61 C128 57 122 57 119 61 Z" fill="#1E1E24" />
        {/* Dress/Top */}
        <path d="M118 72 C118 69 132 69 132 72 L136 102 H114 L118 72 Z" fill="#0D9488" />
        {/* Hands / Phone in hand */}
        <circle cx="125" cy="88" r="4" fill="#ECC5A8" />
        <rect x="123" y="85" width="5" height="8" rx="1" fill="#475569" />
        {/* Legs */}
        <line x1="122" y1="102" x2="122" y2="123" stroke="#ECC5A8" strokeWidth="4" strokeLinecap="round" />
        <line x1="128" y1="102" x2="128" y2="123" stroke="#ECC5A8" strokeWidth="4" strokeLinecap="round" />
        {/* Shoes */}
        <ellipse cx="122" cy="124" rx="3.5" ry="2" fill="#0F766E" />
        <ellipse cx="128" cy="124" rx="3.5" ry="2" fill="#0F766E" />
      </g>

      {/* Clinic Room 1 Door (Right) */}
      <g id="clinic-door">
        {/* Door frame */}
        <rect x="180" y="30" width="46" height="96" rx="2" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Inner Door */}
        <rect x="183" y="33" width="40" height="93" fill="#E2E8F0" />
        {/* Door sign: Room 1 */}
        <rect x="190" y="44" width="26" height="13" rx="2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
        <text x="203" y="53" fill="#475569" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
          Room 1
        </text>
        {/* Door handle */}
        <line x1="187" y1="78" x2="191" y2="78" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        {/* Small window on door */}
        <rect x="194" y="65" width="18" height="2" rx="1" fill="#CBD5E1" />
      </g>
    </svg>
  );
}

export default ClinicLoungeIllustration;
