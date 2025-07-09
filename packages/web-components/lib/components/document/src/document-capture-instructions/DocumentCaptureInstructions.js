import SmartFileUpload from '../../../../domain/file-upload/src/SmartFileUpload';
import styles from '../../../../styles/src/styles';
import '../../../navigation/src';

function frontDocumentIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="173" height="103" viewBox="0 0 173 103" fill="none">
  <path d="M15.3799 21.2759C15.3799 16.8576 18.9616 13.2759 23.3799 13.2759H64.2764C68.6947 13.2759 72.2764 16.8576 72.2764 21.2759V73.5517C72.2764 77.97 68.6947 81.5517 64.2764 81.5517H23.3799C18.9616 81.5517 15.3799 77.97 15.3799 73.5517V21.2759Z" fill="#F6C969"/>
  <g filter="url(#filter0_d_1281_4127)">
    <path d="M60.2117 80.8741C60.2117 80.8741 49.3661 81.5134 44.1952 81.5134C39.0242 81.5134 28.1787 80.8741 28.1787 80.8741C28.1787 80.8741 34.6256 78.4515 35.3307 76.8701C35.7001 76.0962 35.8344 73.2362 35.9015 70.578C35.9687 67.9199 35.9015 65.5646 35.9015 65.5646L44.1952 65.6992L52.4888 65.5646C52.4888 65.5646 52.3881 72.0921 52.7575 75.3223C52.7813 75.8503 52.8832 76.372 53.0597 76.8701C53.7984 78.4515 60.2117 80.8741 60.2117 80.8741Z" fill="url(#paint0_linear_1281_4127)"/>
    <path d="M31.3688 47.126C31.3688 47.126 29.1191 46.3184 28.4812 46.6549C27.8432 46.9914 26.8695 48.6737 27.0038 50.6589C27.0373 51.1636 27.4403 53.6872 29.1527 54.9321C29.6564 55.2686 30.1265 56.951 31.2345 57.1865C32.3426 57.422 32.5105 56.6818 32.5105 56.6818L31.3688 47.126Z" fill="url(#paint1_linear_1281_4127)"/>
    <path style="mix-blend-mode:multiply" opacity="0.6" d="M31.906 51.6683C31.906 51.6683 30.6637 47.7652 28.9848 48.3035C27.3059 48.8419 27.8767 51.6009 27.8767 51.6009C27.8767 51.6009 28.2461 49.0438 29.7571 49.8849C30.5629 50.2887 29.2534 51.029 29.2534 52.072C29.2534 53.1151 30.16 54.36 30.4622 53.6871C30.7644 53.0142 30.9659 50.6252 31.906 51.6683Z" fill="url(#paint2_linear_1281_4127)"/>
    <path style="mix-blend-mode:multiply" opacity="0.6" d="M30.462 53.687C30.7306 52.7785 30.932 51.399 31.4357 51.5335C31.5749 51.5809 31.6986 51.6655 31.7933 51.7781C31.888 51.8908 31.9501 52.0273 31.973 52.1729L31.8386 51.1971C31.8386 51.1971 30.8985 49.683 29.7568 50.9952" fill="url(#paint3_linear_1281_4127)"/>
    <path d="M57.3575 47.126C57.3575 47.126 59.6407 46.3184 60.2787 46.6549C60.9167 46.9914 61.8568 48.6737 61.7561 50.6589C61.7225 51.1636 61.286 53.6872 59.5736 54.9321C59.1035 55.2686 58.5998 56.951 57.4918 57.1865C56.3837 57.422 56.2158 56.6818 56.2158 56.6818L57.3575 47.126Z" fill="url(#paint4_linear_1281_4127)"/>
    <path style="mix-blend-mode:multiply" opacity="0.6" d="M56.8203 51.6683C56.8203 51.6683 58.0627 47.7652 59.7415 48.3035C61.4204 48.8419 60.8832 51.6009 60.8832 51.6009C60.8832 51.6009 60.5138 49.0438 58.9693 49.8849C58.1634 50.2887 59.4729 51.029 59.4729 52.072C59.4729 53.1151 58.5663 54.36 58.2641 53.6871C57.9619 53.0142 57.7605 50.6252 56.8203 51.6683Z" fill="url(#paint5_linear_1281_4127)"/>
    <path style="mix-blend-mode:multiply" opacity="0.6" d="M58.264 56.749C58.1297 56.9509 57.0552 57.5229 56.4844 56.9509C55.9135 56.3789 56.6858 52.7113 56.753 52.173C56.753 52.173 56.5515 56.177 56.8201 56.3452C56.4172 56.1097 58.2304 56.7826 58.264 56.749Z" fill="url(#paint6_linear_1281_4127)"/>
    <path d="M64.4757 81.9845H23.9141L32.5771 78.6534L33.5508 75.457C34.2424 75.3865 34.938 75.364 35.6326 75.3897L35.4312 76.5673C35.4312 76.5673 37.6473 78.8553 44.1949 78.8553C50.0038 78.8553 52.9586 76.5673 52.9586 76.5673L52.7908 75.5243V75.3897C53.4854 75.364 54.181 75.3865 54.8725 75.457L55.8463 78.6534L64.4757 81.9845Z" fill="#151F72"/>
    <path style="mix-blend-mode:multiply" opacity="0.6" d="M33.5509 75.4568C33.383 75.9951 37.7817 79.8309 44.0607 79.8309C48.0849 79.8356 51.9521 78.2662 54.839 75.4568L55.8128 78.6533C55.8128 78.6533 48.7615 81.5133 43.7249 81.5133C38.6883 81.5133 32.5771 78.6533 32.5771 78.6533L33.5509 75.4568Z" fill="url(#paint7_linear_1281_4127)"/>
    <path d="M56.115 37.1326C51.4478 29.6629 38.8898 29.4947 33.2487 35.854C27.6077 42.2133 30.8983 45.1406 31.1334 54.6292C31.3348 60.0464 31.5699 63.613 35.0955 66.6076C36.1386 67.4711 37.2258 68.2797 38.3525 69.0302C43.7249 73.0679 51.4813 69.5349 53.5296 66.473C57.2231 63.6467 56.8537 60.7866 57.2902 54.7301C57.626 46.8903 60.0436 43.2227 56.115 37.1326Z" fill="url(#paint8_linear_1281_4127)"/>
  </g>
  <g filter="url(#filter1_d_1281_4127)">
    <mask id="path-12-inside-1_1281_4127" fill="white">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M18 0C10.268 0 4 6.26801 4 14V80.8276C4 88.5596 10.268 94.8276 18 94.8276H155C162.732 94.8276 169 88.5596 169 80.8276V14C169 6.26801 162.732 0 155 0H18ZM23.7858 14.4876C19.3676 14.4876 15.7858 18.0693 15.7858 22.4876V72.3401C15.7858 76.7584 19.3676 80.3401 23.7858 80.3401H62.7858C67.2041 80.3401 70.7858 76.7584 70.7858 72.3401V22.4876C70.7858 18.0693 67.2041 14.4876 62.7858 14.4876H23.7858Z"/>
    </mask>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18 0C10.268 0 4 6.26801 4 14V80.8276C4 88.5596 10.268 94.8276 18 94.8276H155C162.732 94.8276 169 88.5596 169 80.8276V14C169 6.26801 162.732 0 155 0H18ZM23.7858 14.4876C19.3676 14.4876 15.7858 18.0693 15.7858 22.4876V72.3401C15.7858 76.7584 19.3676 80.3401 23.7858 80.3401H62.7858C67.2041 80.3401 70.7858 76.7584 70.7858 72.3401V22.4876C70.7858 18.0693 67.2041 14.4876 62.7858 14.4876H23.7858Z" fill="#F9F0E7"/>
    <path d="M5.5 14C5.5 7.09644 11.0964 1.5 18 1.5V-1.5C9.43959 -1.5 2.5 5.43958 2.5 14H5.5ZM5.5 80.8276V14H2.5V80.8276H5.5ZM18 93.3276C11.0964 93.3276 5.5 87.7311 5.5 80.8276H2.5C2.5 89.388 9.43958 96.3276 18 96.3276V93.3276ZM155 93.3276H18V96.3276H155V93.3276ZM167.5 80.8276C167.5 87.7311 161.904 93.3276 155 93.3276V96.3276C163.56 96.3276 170.5 89.388 170.5 80.8276H167.5ZM167.5 14V80.8276H170.5V14H167.5ZM155 1.5C161.904 1.5 167.5 7.09644 167.5 14H170.5C170.5 5.43959 163.56 -1.5 155 -1.5V1.5ZM18 1.5H155V-1.5H18V1.5ZM17.2858 22.4876C17.2858 18.8977 20.196 15.9876 23.7858 15.9876V12.9876C18.5391 12.9876 14.2858 17.2409 14.2858 22.4876H17.2858ZM17.2858 72.3401V22.4876H14.2858V72.3401H17.2858ZM23.7858 78.8401C20.196 78.8401 17.2858 75.9299 17.2858 72.3401H14.2858C14.2858 77.5868 18.5391 81.8401 23.7858 81.8401V78.8401ZM62.7858 78.8401H23.7858V81.8401H62.7858V78.8401ZM69.2858 72.3401C69.2858 75.9299 66.3757 78.8401 62.7858 78.8401V81.8401C68.0325 81.8401 72.2858 77.5868 72.2858 72.3401H69.2858ZM69.2858 22.4876V72.3401H72.2858V22.4876H69.2858ZM62.7858 15.9876C66.3757 15.9876 69.2858 18.8977 69.2858 22.4876H72.2858C72.2858 17.2409 68.0325 12.9876 62.7858 12.9876V15.9876ZM23.7858 15.9876H62.7858V12.9876H23.7858V15.9876Z" fill="#001096" mask="url(#path-12-inside-1_1281_4127)"/>
  </g>
  <rect x="86.501" y="23.7069" width="64.8214" height="1.42241" rx="0.711207" fill="#2D2B2A"/>
  <rect x="86.501" y="34.2433" width="64.8214" height="1.42241" rx="0.711207" fill="#2D2B2A"/>
  <rect x="86.501" y="44.1212" width="32.7381" height="1.42241" rx="0.711207" fill="#2D2B2A"/>
  <rect x="27.5713" y="86.2667" width="32.7381" height="2.63621" rx="1.3181" fill="#DBDBC4"/>
  <defs>
    <filter id="filter0_d_1281_4127" x="19.9141" y="31.2932" width="48.5615" height="58.6913" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1281_4127"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1281_4127" result="shape"/>
    </filter>
    <filter id="filter1_d_1281_4127" x="0" y="0" width="173" height="102.828" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1281_4127"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1281_4127" result="shape"/>
    </filter>
    <linearGradient id="paint0_linear_1281_4127" x1="44.1986" y1="81.4966" x2="44.1986" y2="65.578" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFB09A"/>
      <stop offset="0.21" stop-color="#FF9B8D"/>
      <stop offset="0.47" stop-color="#FF8781"/>
      <stop offset="0.74" stop-color="#FF7B79"/>
      <stop offset="1" stop-color="#FF7777"/>
    </linearGradient>
    <linearGradient id="paint1_linear_1281_4127" x1="29.7538" y1="57.2504" x2="29.7538" y2="46.5708" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFB09A"/>
      <stop offset="0.21" stop-color="#FF9B8D"/>
      <stop offset="0.47" stop-color="#FF8781"/>
      <stop offset="0.74" stop-color="#FF7B79"/>
      <stop offset="1" stop-color="#FF7777"/>
    </linearGradient>
    <linearGradient id="paint2_linear_1281_4127" x1="29.888" y1="53.8755" x2="29.888" y2="48.2632" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFE7D8"/>
      <stop offset="0.29" stop-color="#FABDC9"/>
      <stop offset="0.59" stop-color="#F597BB"/>
      <stop offset="0.84" stop-color="#F280B3"/>
      <stop offset="0.99" stop-color="#F177B0"/>
    </linearGradient>
    <linearGradient id="paint3_linear_1281_4127" x1="30.8683" y1="53.6937" x2="30.8683" y2="50.4636" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFE7D8"/>
      <stop offset="0.99" stop-color="#CE77F1"/>
    </linearGradient>
    <linearGradient id="paint4_linear_1281_4127" x1="58.9759" y1="57.2504" x2="58.9759" y2="46.5708" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFB09A"/>
      <stop offset="0.21" stop-color="#FF9B8D"/>
      <stop offset="0.47" stop-color="#FF8781"/>
      <stop offset="0.74" stop-color="#FF7B79"/>
      <stop offset="1" stop-color="#FF7777"/>
    </linearGradient>
    <linearGradient id="paint5_linear_1281_4127" x1="58.845" y1="53.8755" x2="58.845" y2="48.2632" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFE7D8"/>
      <stop offset="0.29" stop-color="#FABDC9"/>
      <stop offset="0.59" stop-color="#F597BB"/>
      <stop offset="0.84" stop-color="#F280B3"/>
      <stop offset="0.99" stop-color="#F177B0"/>
    </linearGradient>
    <linearGradient id="paint6_linear_1281_4127" x1="54.5402" y1="54.6965" x2="59.1672" y2="54.6965" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFE7D8"/>
      <stop offset="0.29" stop-color="#FABDC9"/>
      <stop offset="0.59" stop-color="#F597BB"/>
      <stop offset="0.84" stop-color="#F280B3"/>
      <stop offset="0.99" stop-color="#F177B0"/>
    </linearGradient>
    <linearGradient id="paint7_linear_1281_4127" x1="44.195" y1="75.4635" x2="44.195" y2="81.4965" gradientUnits="userSpaceOnUse">
      <stop stop-color="#151F72"/>
      <stop offset="0.19" stop-color="#151F72"/>
      <stop offset="0.54" stop-color="#7FCBF5"/>
      <stop offset="0.82" stop-color="#C574EC"/>
      <stop offset="0.99" stop-color="#FBD1EE"/>
    </linearGradient>
    <linearGradient id="paint8_linear_1281_4127" x1="30.0589" y1="51.0693" x2="58.3379" y2="51.0693" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFB09A"/>
      <stop offset="0.06" stop-color="#FF9B89"/>
      <stop offset="0.13" stop-color="#FF8A7B"/>
      <stop offset="0.23" stop-color="#FF7F71"/>
      <stop offset="0.36" stop-color="#FF786C"/>
      <stop offset="0.71" stop-color="#FF766A"/>
    </linearGradient>
  </defs>
</svg>`;
}

function backDocumentIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="182" height="108" viewBox="0 0 182 108" fill="none">
  <path d="M143 68C143 65.7909 144.791 64 147 64H164C166.209 64 168 65.7909 168 68V89C168 91.2091 166.209 93 164 93H147C144.791 93 143 91.2091 143 89V68Z" fill="#F6C969"/>
  <g filter="url(#filter0_d_1281_4284)">
    <mask id="path-2-inside-1_1281_4284" fill="white">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M18 0C10.268 0 4 6.26801 4 14V86C4 93.732 10.268 100 18 100H164C171.732 100 178 93.732 178 86V14C178 6.26801 171.732 0 164 0H18ZM148 67C145.791 67 144 68.7909 144 71V85C144 87.2091 145.791 89 148 89H162C164.209 89 166 87.2091 166 85V71C166 68.7909 164.209 67 162 67H148Z"/>
    </mask>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18 0C10.268 0 4 6.26801 4 14V86C4 93.732 10.268 100 18 100H164C171.732 100 178 93.732 178 86V14C178 6.26801 171.732 0 164 0H18ZM148 67C145.791 67 144 68.7909 144 71V85C144 87.2091 145.791 89 148 89H162C164.209 89 166 87.2091 166 85V71C166 68.7909 164.209 67 162 67H148Z" fill="#F9F0E7"/>
    <path d="M5.5 14C5.5 7.09644 11.0964 1.5 18 1.5V-1.5C9.43959 -1.5 2.5 5.43959 2.5 14H5.5ZM5.5 86V14H2.5V86H5.5ZM18 98.5C11.0964 98.5 5.5 92.9036 5.5 86H2.5C2.5 94.5604 9.43959 101.5 18 101.5V98.5ZM164 98.5H18V101.5H164V98.5ZM176.5 86C176.5 92.9036 170.904 98.5 164 98.5V101.5C172.56 101.5 179.5 94.5604 179.5 86H176.5ZM176.5 14V86H179.5V14H176.5ZM164 1.5C170.904 1.5 176.5 7.09644 176.5 14H179.5C179.5 5.43959 172.56 -1.5 164 -1.5V1.5ZM18 1.5H164V-1.5H18V1.5ZM145.5 71C145.5 69.6193 146.619 68.5 148 68.5V65.5C144.962 65.5 142.5 67.9624 142.5 71H145.5ZM145.5 85V71H142.5V85H145.5ZM148 87.5C146.619 87.5 145.5 86.3807 145.5 85H142.5C142.5 88.0376 144.962 90.5 148 90.5V87.5ZM162 87.5H148V90.5H162V87.5ZM164.5 85C164.5 86.3807 163.381 87.5 162 87.5V90.5C165.038 90.5 167.5 88.0376 167.5 85H164.5ZM164.5 71V85H167.5V71H164.5ZM162 68.5C163.381 68.5 164.5 69.6193 164.5 71H167.5C167.5 67.9624 165.038 65.5 162 65.5V68.5ZM148 68.5H162V65.5H148V68.5Z" fill="#001096" mask="url(#path-2-inside-1_1281_4284)"/>
  </g>
  <rect x="134" y="10" width="3" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="148.733" y="10" width="2" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="154" y="10" width="2" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="166" y="10" width="1.3" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="157" y="10" width="2" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="141.8" y="10" width="5" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="161" y="10" width="4" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="137.767" y="10" width="1" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="151.2" y="10" width="1" height="9" rx="0.5" fill="#DBDBC4"/>
  <rect x="20.25" y="32.25" width="98.5" height="0.5" rx="0.25" fill="#2D2B2A" stroke="#2D2B2A" stroke-width="0.5"/>
  <rect x="20.25" y="41.75" width="98.5" height="0.5" rx="0.25" fill="#2D2B2A" stroke="#2D2B2A" stroke-width="0.5"/>
  <rect x="20.25" y="51.25" width="49.5" height="0.5" rx="0.25" fill="#2D2B2A" stroke="#2D2B2A" stroke-width="0.5"/>
  <rect x="20.25" y="75.25" width="49.5" height="0.5" rx="0.25" fill="#2D2B2A" stroke="#2D2B2A" stroke-width="0.5"/>
  <rect x="20.25" y="84.75" width="49.5" height="0.5" rx="0.25" fill="#2D2B2A" stroke="#2D2B2A" stroke-width="0.5"/>
  <defs>
    <filter id="filter0_d_1281_4284" x="0" y="0" width="182" height="108" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1281_4284"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1281_4284" result="shape"/>
    </filter>
  </defs>
</svg>`;
}

function templateString() {
  return `
  <style>
    .controls {
      width: 100%;
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .content-root {
      height: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    .content-header, .content-body, .content-footer {
      width: 100%;
    }

    .content-body {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    
    .content-body header {
      margin-top: 1rem;
    }
  </style>
    <div id="document-capture-instructions-screen" class="flow center">
        <div class="content-root">
            <div class="content-header">
        <smileid-navigation theme-color='${this.themeColor}' ${this.showNavigation ? 'show-navigation' : ''} ${this.hideBack ? 'hide-back' : ''}></smileid-navigation>
        </div>
        <div class="content-body">
        <header>
        ${this.isFrontOfId ? frontDocumentIcon() : backDocumentIcon()}
            <h1 class='text-2xl title-color font-bold'>${this.title}</h1>
        <p class="description text-sm font-normal">
            We'll use it to verify your identity.
          </p>
          <p class="description padding-bottom-2">
          Please follow the instructions below.
          </p>
        </header>
        <div class="instructions-wrapper">
            <div class="instructions">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="38"
                height="38"
                viewBox="0 0 38 38"
                fill="none"
                >
                <g clip-path="url(#clip0_604_670)">
                    <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M31.8569 19C31.8569 21.5428 31.1029 24.0285 29.6902 26.1428C28.2774 28.2571 26.2695 29.9049 23.9203 30.878C21.571 31.8511 18.986 32.1057 16.492 31.6096C13.9981 31.1136 11.7072 29.8891 9.90919 28.091C8.11115 26.293 6.88668 24.0022 6.3906 21.5082C5.89452 19.0143 6.14913 16.4292 7.12222 14.08C8.09531 11.7307 9.74318 9.72279 11.8574 8.31008C13.9717 6.89737 16.4574 6.14334 19.0002 6.14334C22.41 6.14334 25.6802 7.49788 28.0913 9.90897C30.5024 12.3201 31.8569 15.5902 31.8569 19Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M19.6064 4.5419H18.394L18.9912 0L19.6064 4.5419Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M26.7541 6.77667L25.7046 6.17048L28.4913 2.54239L26.7541 6.77667Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M31.8298 12.2957L31.2236 11.2462L35.4489 9.49097L31.8298 12.2957Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M33.4674 19.6062V18.3938L38.0003 18.9909L33.4674 19.6062Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M31.2236 26.7538L31.8298 25.7043L35.4579 28.491L31.2236 26.7538Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M25.7046 31.8295L26.7541 31.2233L28.5094 35.4486L25.7046 31.8295Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M18.394 33.4671H19.6064L19.0093 38L18.394 33.4671Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M11.2464 31.2233L12.2959 31.8295L9.50928 35.4576L11.2464 31.2233Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M6.17068 25.7043L6.77687 26.7538L2.55164 28.509L6.17068 25.7043Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M4.54215 18.3938V19.6062L0.000244141 19.009L4.54215 18.3938Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M6.77689 11.2462L6.1707 12.2957L2.5426 9.50903L6.77689 11.2462Z"
                    fill="${this.themeColor}"
                    />
                    <path
                    d="M12.296 6.17047L11.2464 6.77666L9.49121 2.55142L12.296 6.17047Z"
                    fill="${this.themeColor}"
                    />
                </g>
                <defs>
                    <clipPath id="clip0_604_670">
                    <rect
                        width="38"
                        height="38"
                        fill="white"
                        transform="translate(0.000244141)"
                    />
                    </clipPath>
                </defs>
                </svg>
                <div class="instruction">
                <p class="instruction-header font-bold text-base">Good Light</p>
                <p class="instruction-body text-xs font-medium">
                  Make sure the image is taken in a well-lit environment where the ID document is easy to read.
                </p>
            </div>
        </div>
        <div class="instructions">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            width="38"
            height="36"
            viewBox="0 0 38 36"
            fill="none"
            >
            <g clip-path="url(#clip0_604_672)">
                <path
                d="M36.7211 12.6391H1.22537C1.06275 13.0909 0.910962 13.5427 0.77002 14.0055H37.1764C37.0463 13.5427 36.8946 13.0909 36.7211 12.6391Z"
                fill="${this.themeColor}"
                />
                <path
                d="M37.3716 14.7438H0.574875C0.466458 15.1625 0.379725 15.5813 0.303833 16.011H37.6426C37.5667 15.5813 37.48 15.1625 37.3716 14.7438Z"
                fill="${this.themeColor}"
                />
                <path
                d="M37.7727 16.8485H0.173703C0.119494 17.2342 0.0869685 17.6198 0.0544434 18.0055H37.892C37.8594 17.6198 37.8269 17.2342 37.7727 16.8485Z"
                fill="${this.themeColor}"
                />
                <path
                d="M37.9462 19.4711C37.9462 19.2948 37.9462 19.1295 37.9353 18.9532H0.0110865C0.000244802 19.1295 0.000244141 19.2948 0.000244141 19.4711C0.000244141 19.6474 0.000244802 19.8347 0.0110865 20.011H37.9353C37.9462 19.8347 37.9462 19.6474 37.9462 19.4711Z"
                fill="${this.themeColor}"
                />
                <path
                d="M37.8811 21.0579H0.0653076C0.086991 21.3774 0.119515 21.697 0.162882 22.0055H37.7836C37.8269 21.697 37.8595 21.3774 37.8811 21.0579Z"
                fill="${this.themeColor}"
                />
                <path
                d="M37.5992 23.1625H0.347168C0.401376 23.449 0.466426 23.7245 0.531477 24H37.4149C37.48 23.7245 37.545 23.449 37.5992 23.1625Z"
                fill="${this.themeColor}"
                />
                <path
                d="M37.0788 25.2672H0.867554C0.954287 25.5096 1.03018 25.7631 1.11691 26.0055H36.8295C36.9162 25.7631 37.0029 25.5096 37.0788 25.2672Z"
                fill="${this.themeColor}"
                />
                <path
                d="M36.2874 27.3719H1.65906L1.95178 28H35.9947L36.2874 27.3719Z"
                fill="${this.themeColor}"
                />
                <path
                d="M35.2032 29.4766H2.75403C2.84799 29.6529 2.95641 29.8292 3.07928 30.0055H34.878L35.2032 29.4766Z"
                fill="${this.themeColor}"
                />
                <path
                d="M33.7396 31.5813H4.20679L4.54288 32H33.4035L33.7396 31.5813Z"
                fill="${this.themeColor}"
                />
                <path
                d="M31.7989 33.6859H6.14746L6.49439 33.9945H31.452L31.7989 33.6859Z"
                fill="${this.themeColor}"
                />
                <path
                d="M29.0993 35.7906H8.84705L9.18314 36H28.7632L29.0993 35.7906Z"
                fill="${this.themeColor}"
                />
                <path
                d="M34.2384 8.01102C33.8914 7.53719 33.5228 7.07438 33.1325 6.63361C29.8258 2.60055 24.6977 0 18.9407 0C12.891 0 7.53525 2.86501 4.25021 7.26171H4.28274C4.08759 7.51515 3.89244 7.75757 3.70813 8.01102H34.2384Z"
                fill="${this.themeColor}"
                />
                <path
                d="M34.531 8.44077H3.41533C3.06839 8.94765 2.74314 9.47658 2.43958 10.0165H35.5068C35.2124 9.47215 34.8866 8.94597 34.531 8.44077Z"
                fill="${this.themeColor}"
                />
                <path
                d="M35.7887 10.5344H2.15776C1.9084 11.0193 1.68072 11.5151 1.47473 12.011H36.4717C36.2657 11.5151 36.0381 11.0193 35.7887 10.5344Z"
                fill="${this.themeColor}"
                />
            </g>
            <defs>
                <clipPath id="clip0_604_672">
                <rect
                    width="37.9459"
                    height="36"
                    fill="white"
                    transform="translate(0.000244141)"
                />
                </clipPath>
            </defs>
            </svg>
            <div>
                <p class="instruction-header font-bold text-base">Clear Image</p>
                <p class="instruction-body text-xs font-medium">
                  Hold your camera steady so the words on the ID are not blurry.
                </p>
            </div>
        </div>
        <div id="error" class='color-red'>
        </div>
        </div>
    <div class='controls'>
    ${
      this.supportBothCaptureModes || this.documentCaptureModes === 'camera'
        ? `
    <button data-variant='solid full-width' class='button' type='button' id='take-photo'>
        Take Photo
    </button>
    `
        : ''
    }
    ${
      this.supportBothCaptureModes || this.documentCaptureModes === 'upload'
        ? `
    <label id='upload-photo-label' data-variant='${
      this.supportBothCaptureModes ? 'outline' : 'solid'
    }' class='button'>
        <input type='file' hidden onclick='this.value=null;' id='upload-photo' name='document' accept='image/png, image/jpeg' />
        <span>Upload Photo</span>
    </label>
    `
        : ''
    }
</div>
${
  this.hideAttribution
    ? ''
    : `
  <div class="content-footer">
    <powered-by-smile-id></powered-by-smile-id>
  </div>
  `
}
    </div>
  </div>
</div>
  ${styles(this.themeColor)}
  `;
}

class DocumentInstruction extends HTMLElement {
  constructor() {
    super();
    this.templateString = templateString.bind(this);
    this.render = () => this.templateString();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = this.render();

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.navigation = this.shadowRoot.querySelector('smileid-navigation');
    this.takeDocumentPhotoButton = this.shadowRoot.querySelector('#take-photo');
    this.uploadDocumentPhotoButton =
      this.shadowRoot.querySelector('#upload-photo');

    this.navigation.addEventListener('navigation.back', () => {
      this.handleBackEvents();
    });

    this.navigation.addEventListener('navigation.close', () => {
      this.handleCloseEvents();
    });

    if (this.takeDocumentPhotoButton) {
      this.takeDocumentPhotoButton.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('document-capture-instructions.capture'),
        );
      });
    }

    if (this.uploadDocumentPhotoButton) {
      this.uploadDocumentPhotoButton.addEventListener(
        'change',
        async (event) => {
          this.shadowRoot.querySelector('#error').innerHTML = '';
          try {
            const { files } = event.target;

            // validate file, and convert file to data url
            const fileData = await SmartFileUpload.retrieve(files);

            this.dispatchEvent(
              new CustomEvent('document-capture-instructions.upload', {
                detail: { image: fileData, previewImage: fileData },
              }),
            );
          } catch (error) {
            this.shadowRoot.querySelector('#error').innerHTML = error.message;
          }
        },
      );
    }
  }

  get hideBack() {
    return this.hasAttribute('hide-back-to-host');
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation');
  }

  get themeColor() {
    return this.getAttribute('theme-color') || '#001096';
  }

  get hideAttribution() {
    return this.hasAttribute('hide-attribution');
  }

  get documentCaptureModes() {
    return this.getAttribute('document-capture-modes') || 'camera';
  }

  get supportBothCaptureModes() {
    const value = this.documentCaptureModes;
    return value.includes('camera') && value.includes('upload');
  }

  get title() {
    return this.getAttribute('title') || 'Submit Front of ID';
  }

  get sideOfId() {
    return (this.getAttribute('side-of-id') || 'front').toLowerCase();
  }

  get isFrontOfId() {
    return this.sideOfId === 'front';
  }

  get isBackOfId() {
    return !this.isFrontOfId;
  }

  handleBackEvents() {
    this.dispatchEvent(
      new CustomEvent('document-capture-instructions.cancelled'),
    );
  }

  handleCloseEvents() {
    this.dispatchEvent(new CustomEvent('document-capture-instructions.close'));
  }
}

if (
  'customElements' in window &&
  !customElements.get('document-capture-instructions')
) {
  window.customElements.define(
    'document-capture-instructions',
    DocumentInstruction,
  );
}

export default DocumentInstruction;
