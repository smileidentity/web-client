// Shimmer SVG markup imported as raw strings via Vite's ?raw query.
// Returned by getShimmerSvg() based on documentType + sideOfId so the
// guide-box overlay shows a contextual silhouette of the expected document.
import passportShimmer from './Passport-Shimmer.svg?raw';
import greenbookShimmer from './Greenbook_Shimmer.svg?raw';
import idFrontShimmer from './ID_Front_Shimmer.svg?raw';
import idBackShimmer from './ID_Back_Shimmer.svg?raw';

export type ShimmerDocType = 'id-card' | 'passport' | 'greenbook' | null;
export type ShimmerSide = 'Front' | 'Back' | string | undefined;

export function getShimmerSvg(
  docType: ShimmerDocType,
  side: ShimmerSide,
): string | null {
  if (docType === 'passport') return passportShimmer;
  if (docType === 'greenbook') return greenbookShimmer;
  if (docType === 'id-card') {
    return String(side).toLowerCase() === 'back' ? idBackShimmer : idFrontShimmer;
  }
  return null;
}
