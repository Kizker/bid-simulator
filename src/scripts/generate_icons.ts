import fs from "fs";
import path from "path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");

// SVG Brand Icon: Bidding Plus (Dynamic Auction Gavel + Pulse Waves + Plus Sparkle)
// Designed for extreme sharpness, high contrast, and pristine rendering at both 16px and 512px.
function generateSvgIcon(size = 512, isMaskable = false): string {
  // Safe padding for maskable icons (Android adaptive icon safe zone is 80% circle)
  const padding = isMaskable ? 48 : 24;
  const contentSize = size - padding * 2;
  const center = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#021B3D"/>
      <stop offset="35%" stop-color="#0055B8"/>
      <stop offset="75%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>

    <!-- Glass & Light Highlights -->
    <linearGradient id="lightSheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
    </linearGradient>

    <!-- Gold Luxury Gradient for Auction Gavel -->
    <linearGradient id="goldHead" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="25%" stop-color="#FCD34D"/>
      <stop offset="70%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>

    <linearGradient id="goldHandle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>

    <linearGradient id="goldBase" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#92400E"/>
      <stop offset="25%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#FEF08A"/>
      <stop offset="75%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>

    <!-- Plus Symbol Radiant Glow -->
    <linearGradient id="plusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#67E8F9"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="glowDrop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
    <filter id="sparkleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Shape: Squircle / Rounded Container -->
  ${
    isMaskable
      ? `<rect width="${size}" height="${size}" fill="url(#bgGrad)"/>`
      : `<rect x="8" y="8" width="${size - 16}" height="${size - 16}" rx="${Math.round(size * 0.22)}" fill="url(#bgGrad)" stroke="rgba(255,255,255,0.22)" stroke-width="4"/>`
  }

  <!-- Ambient Light Reflection Overlay -->
  ${
    isMaskable
      ? `<rect width="${size}" height="${size}" fill="url(#lightSheen)"/>`
      : `<rect x="8" y="8" width="${size - 16}" height="${size - 16}" rx="${Math.round(size * 0.22)}" fill="url(#lightSheen)"/>`
  }

  <!-- Graphic Center Group -->
  <g transform="translate(${center}, ${center}) scale(${contentSize / 464})" filter="url(#glowDrop)">
    <!-- 1. Bidding Radio / Wave Pulses (Symbolizing Live Action) -->
    <path d="M -80 -120 A 170 170 0 0 1 120 -80" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="12" stroke-linecap="round"/>
    <path d="M -50 -90 A 130 130 0 0 1 90 -50" fill="none" stroke="#38BDF8" stroke-width="10" stroke-linecap="round" stroke-dasharray="14 10"/>

    <!-- 2. Auction Sound Block (Base) at Bottom Left -->
    <g transform="translate(-65, 85)">
      <!-- Base Plate -->
      <path d="M -60 15 L 60 15 L 45 35 L -45 35 Z" fill="#1E293B"/>
      <!-- Gold Disc Upper Surface -->
      <ellipse cx="0" cy="15" rx="60" ry="16" fill="url(#goldBase)" stroke="#B45309" stroke-width="2"/>
      <!-- Inner Ring -->
      <ellipse cx="0" cy="15" rx="46" ry="11" fill="#0F172A" stroke="#FDE68A" stroke-width="1.5"/>
    </g>

    <!-- 3. Auction Gavel (Head and Handle) rotated dynamically at -38deg -->
    <g transform="translate(10, 15) rotate(-38)">
      <!-- Gavel Handle -->
      <path d="M -12 25 L 12 25 L 8 160 L -8 160 Z" fill="url(#goldHandle)" stroke="#78350F" stroke-width="2" rx="4"/>
      <!-- Handle Grips / Brass Rings -->
      <rect x="-10" y="55" width="20" height="7" rx="2" fill="#FEF08A"/>
      <rect x="-9" y="85" width="18" height="6" rx="2" fill="#FEF08A"/>
      <circle cx="0" cy="160" r="11" fill="url(#goldHead)" stroke="#78350F" stroke-width="2"/>

      <!-- Gavel Head (Main Cylinder) -->
      <g transform="translate(0, 0)">
        <!-- Center Body -->
        <rect x="-56" y="-28" width="112" height="56" rx="8" fill="url(#goldHead)" stroke="#78350F" stroke-width="3"/>
        
        <!-- Center Metallic Band with BP Inscription -->
        <rect x="-16" y="-28" width="32" height="56" fill="#0F172A" stroke="#FCD34D" stroke-width="2"/>
        <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="900" fill="#FCD34D" text-anchor="middle" letter-spacing="1">BP</text>

        <!-- Left Strike Cap -->
        <path d="M -56 -32 L -68 -28 L -68 28 L -56 32 Z" fill="url(#goldBase)" stroke="#78350F" stroke-width="2.5"/>
        <line x1="-56" y1="-28" x2="-56" y2="28" stroke="#FEF08A" stroke-width="3"/>

        <!-- Right Strike Cap -->
        <path d="M 56 -32 L 68 -28 L 68 28 L 56 32 Z" fill="url(#goldBase)" stroke="#78350F" stroke-width="2.5"/>
        <line x1="56" y1="-28" x2="56" y2="28" stroke="#FEF08A" stroke-width="3"/>

        <!-- Highlights and Shine -->
        <line x1="-50" y1="-18" x2="50" y2="-18" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      </g>
    </g>

    <!-- 4. The "PLUS" Badge Sparkle (Upper Right) -->
    <g transform="translate(115, -95)" filter="url(#sparkleGlow)">
      <!-- Glowing Circle Backing -->
      <circle cx="0" cy="0" r="44" fill="#0055B8" stroke="#38BDF8" stroke-width="4"/>
      <!-- Inner Pulse Core -->
      <circle cx="0" cy="0" r="36" fill="url(#plusGrad)"/>
      
      <!-- Plus Symbol -->
      <path d="M -6 -20 L 6 -20 L 6 -6 L 20 -6 L 20 6 L 6 6 L 6 20 L -6 20 L -6 6 L -20 6 L -20 -6 L -6 -6 Z" 
            fill="#021B3D" stroke="#003D82" stroke-width="1.5"/>
    </g>

    <!-- 5. Dynamic Flash / Spark Stars -->
    <g transform="translate(-115, -45) scale(0.65)" fill="#FEF08A">
      <path d="M 0 -22 Q 0 0 22 0 Q 0 0 0 22 Q 0 0 -22 0 Q 0 0 0 -22 Z"/>
    </g>
    <g transform="translate(55, 125) scale(0.45)" fill="#FFFFFF">
      <path d="M 0 -20 Q 0 0 20 0 Q 0 0 0 20 Q 0 0 -20 0 Q 0 0 0 -20 Z"/>
    </g>
  </g>
</svg>`;
}

async function run() {
  console.log("🎨 Generating crisp high-res Bidding Plus icons and favicons...");

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Generate favicon.svg (infinite resolution, ultra-sharp vector)
  const standardSvg = generateSvgIcon(512, false);
  const maskableSvg = generateSvgIcon(512, true);

  const svgPath = path.join(publicDir, "favicon.svg");
  fs.writeFileSync(svgPath, standardSvg, "utf8");
  console.log("✅ Created public/favicon.svg (Vektor SVG tak terbatas)");

  // 2. Generate PNG 512x512
  const icon512Path = path.join(publicDir, "icon-512.png");
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(icon512Path);
  console.log("✅ Created public/icon-512.png (512x512)");

  // 3. Generate PNG 192x192
  const icon192Path = path.join(publicDir, "icon-192.png");
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(icon192Path);
  console.log("✅ Created public/icon-192.png (192x192)");

  // 4. Generate Apple Touch Icon 180x180
  const appleTouchPath = path.join(publicDir, "apple-touch-icon.png");
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(appleTouchPath);
  console.log("✅ Created public/apple-touch-icon.png (180x180)");

  // 5. Generate Maskable Icons for Android PWA Adaptive Launchers
  const maskable192Path = path.join(publicDir, "icon-maskable-192.png");
  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(maskable192Path);
  console.log("✅ Created public/icon-maskable-192.png (192x192 maskable)");

  const maskable512Path = path.join(publicDir, "icon-maskable-512.png");
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(maskable512Path);
  console.log("✅ Created public/icon-maskable-512.png (512x512 maskable)");

  // 6. Generate favicon.ico (32x32 & 48x48 PNG container compatible with modern browsers)
  const faviconIcoPath = path.join(publicDir, "favicon.ico");
  await sharp(Buffer.from(standardSvg))
    .resize(48, 48)
    .png({ quality: 100 })
    .toFile(faviconIcoPath);
  console.log("✅ Created public/favicon.ico (48x48)");

  // 7. Generate favicon-32x32.png and favicon-16x16.png
  await sharp(Buffer.from(standardSvg))
    .resize(32, 32)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "favicon-32x32.png"));
  await sharp(Buffer.from(standardSvg))
    .resize(16, 16)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, "favicon-16x16.png"));
  console.log("✅ Created public/favicon-32x32.png & favicon-16x16.png");

  console.log("🎉 All icons generated successfully!");
}

run().catch((err) => {
  console.error("Failed to generate icons:", err);
  process.exit(1);
});
