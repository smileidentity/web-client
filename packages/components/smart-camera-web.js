(()=>{var u=class extends HTMLElement{constructor(){super();let e=document.createElement("template");e.innerHTML=`
        <p style='margin-inline: auto; max-inline-size: 10rem'>
          <svg viewBox="0 0 90 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.544 7V1.4H2.616C3.064 1.4 3.43467 1.47467 3.728 1.624C4.02133 1.77333 4.24 1.97867 4.384 2.24C4.528 2.50133 4.6 2.79467 4.6 3.12C4.6 3.42933 4.53067 3.71467 4.392 3.976C4.25333 4.232 4.03733 4.44 3.744 4.6C3.45067 4.75467 3.07467 4.832 2.616 4.832H1.568V7H0.544ZM1.568 4H2.552C2.90933 4 3.16533 3.92267 3.32 3.768C3.48 3.608 3.56 3.392 3.56 3.12C3.56 2.84267 3.48 2.62667 3.32 2.472C3.16533 2.312 2.90933 2.232 2.552 2.232H1.568V4ZM7.08025 7.096C6.69625 7.096 6.34958 7.008 6.04025 6.832C5.73625 6.656 5.49358 6.41333 5.31225 6.104C5.13625 5.78933 5.04825 5.42667 5.04825 5.016C5.04825 4.60533 5.13892 4.24533 5.32025 3.936C5.50158 3.62133 5.74425 3.376 6.04825 3.2C6.35758 3.024 6.70425 2.936 7.08825 2.936C7.46692 2.936 7.80825 3.024 8.11225 3.2C8.42158 3.376 8.66425 3.62133 8.84025 3.936C9.02158 4.24533 9.11225 4.60533 9.11225 5.016C9.11225 5.42667 9.02158 5.78933 8.84025 6.104C8.66425 6.41333 8.42158 6.656 8.11225 6.832C7.80292 7.008 7.45892 7.096 7.08025 7.096ZM7.08025 6.208C7.34692 6.208 7.57892 6.10933 7.77625 5.912C7.97358 5.70933 8.07225 5.41067 8.07225 5.016C8.07225 4.62133 7.97358 4.32533 7.77625 4.128C7.57892 3.92533 7.34958 3.824 7.08825 3.824C6.81625 3.824 6.58158 3.92533 6.38425 4.128C6.19225 4.32533 6.09625 4.62133 6.09625 5.016C6.09625 5.41067 6.19225 5.70933 6.38425 5.912C6.58158 6.10933 6.81358 6.208 7.08025 6.208ZM10.6632 7L9.50319 3.032H10.5192L11.2072 5.888L12.0072 3.032H13.1432L13.9432 5.888L14.6392 3.032H15.6552L14.4872 7H13.4232L12.5752 4.032L11.7272 7H10.6632ZM18.0886 7.096C17.6886 7.096 17.334 7.01067 17.0246 6.84C16.7153 6.66933 16.4726 6.42933 16.2966 6.12C16.1206 5.81067 16.0326 5.45333 16.0326 5.048C16.0326 4.63733 16.118 4.272 16.2886 3.952C16.4646 3.632 16.7046 3.384 17.0086 3.208C17.318 3.02667 17.6806 2.936 18.0966 2.936C18.486 2.936 18.83 3.02133 19.1286 3.192C19.4273 3.36267 19.6593 3.59733 19.8246 3.896C19.9953 4.18933 20.0806 4.51733 20.0806 4.88C20.0806 4.93867 20.078 5 20.0726 5.064C20.0726 5.128 20.07 5.19467 20.0646 5.264H17.0486C17.07 5.57333 17.1766 5.816 17.3686 5.992C17.566 6.168 17.8033 6.256 18.0806 6.256C18.2886 6.256 18.462 6.21067 18.6006 6.12C18.7446 6.024 18.8513 5.90133 18.9206 5.752H19.9606C19.886 6.00267 19.7606 6.232 19.5846 6.44C19.414 6.64267 19.2006 6.80267 18.9446 6.92C18.694 7.03733 18.4086 7.096 18.0886 7.096ZM18.0966 3.768C17.846 3.768 17.6246 3.84 17.4326 3.984C17.2406 4.12267 17.118 4.336 17.0646 4.624H19.0406C19.0246 4.36267 18.9286 4.15467 18.7526 4C18.5766 3.84533 18.358 3.768 18.0966 3.768ZM20.9419 7V3.032H21.8539L21.9499 3.776C22.0939 3.52 22.2885 3.31733 22.5339 3.168C22.7845 3.01333 23.0779 2.936 23.4139 2.936V4.016H23.1259C22.9019 4.016 22.7019 4.05067 22.5259 4.12C22.3499 4.18933 22.2112 4.30933 22.1099 4.48C22.0139 4.65067 21.9659 4.888 21.9659 5.192V7H20.9419ZM25.9714 7.096C25.5714 7.096 25.2168 7.01067 24.9074 6.84C24.5981 6.66933 24.3554 6.42933 24.1794 6.12C24.0034 5.81067 23.9154 5.45333 23.9154 5.048C23.9154 4.63733 24.0008 4.272 24.1714 3.952C24.3474 3.632 24.5874 3.384 24.8914 3.208C25.2008 3.02667 25.5634 2.936 25.9794 2.936C26.3688 2.936 26.7128 3.02133 27.0114 3.192C27.3101 3.36267 27.5421 3.59733 27.7074 3.896C27.8781 4.18933 27.9634 4.51733 27.9634 4.88C27.9634 4.93867 27.9608 5 27.9554 5.064C27.9554 5.128 27.9528 5.19467 27.9474 5.264H24.9314C24.9528 5.57333 25.0594 5.816 25.2514 5.992C25.4488 6.168 25.6861 6.256 25.9634 6.256C26.1714 6.256 26.3448 6.21067 26.4834 6.12C26.6274 6.024 26.7341 5.90133 26.8034 5.752H27.8434C27.7688 6.00267 27.6434 6.232 27.4674 6.44C27.2968 6.64267 27.0834 6.80267 26.8274 6.92C26.5768 7.03733 26.2914 7.096 25.9714 7.096ZM25.9794 3.768C25.7288 3.768 25.5074 3.84 25.3154 3.984C25.1234 4.12267 25.0008 4.336 24.9474 4.624H26.9234C26.9074 4.36267 26.8114 4.15467 26.6354 4C26.4594 3.84533 26.2408 3.768 25.9794 3.768ZM30.6487 7.096C30.2754 7.096 29.942 7.00533 29.6487 6.824C29.3554 6.64267 29.1234 6.39467 28.9527 6.08C28.782 5.76533 28.6967 5.408 28.6967 5.008C28.6967 4.608 28.782 4.25333 28.9527 3.944C29.1234 3.62933 29.3554 3.384 29.6487 3.208C29.942 3.02667 30.2754 2.936 30.6487 2.936C30.9474 2.936 31.2087 2.992 31.4327 3.104C31.6567 3.216 31.838 3.37333 31.9767 3.576V1.24H33.0007V7H32.0887L31.9767 6.432C31.8487 6.608 31.678 6.76267 31.4647 6.896C31.2567 7.02933 30.9847 7.096 30.6487 7.096ZM30.8647 6.2C31.1954 6.2 31.4647 6.09067 31.6727 5.872C31.886 5.648 31.9927 5.36267 31.9927 5.016C31.9927 4.66933 31.886 4.38667 31.6727 4.168C31.4647 3.944 31.1954 3.832 30.8647 3.832C30.5394 3.832 30.27 3.94133 30.0567 4.16C29.8434 4.37867 29.7367 4.66133 29.7367 5.008C29.7367 5.35467 29.8434 5.64 30.0567 5.864C30.27 6.088 30.5394 6.2 30.8647 6.2ZM38.3017 7.096C38.003 7.096 37.7417 7.04 37.5177 6.928C37.2937 6.816 37.1124 6.65867 36.9737 6.456L36.8617 7H35.9497V1.24H36.9737V3.6C37.1017 3.424 37.2697 3.26933 37.4777 3.136C37.691 3.00267 37.9657 2.936 38.3017 2.936C38.675 2.936 39.0084 3.02667 39.3017 3.208C39.595 3.38933 39.827 3.63733 39.9977 3.952C40.1684 4.26667 40.2537 4.624 40.2537 5.024C40.2537 5.424 40.1684 5.78133 39.9977 6.096C39.827 6.40533 39.595 6.65067 39.3017 6.832C39.0084 7.008 38.675 7.096 38.3017 7.096ZM38.0857 6.2C38.411 6.2 38.6804 6.09067 38.8937 5.872C39.107 5.65333 39.2137 5.37067 39.2137 5.024C39.2137 4.67733 39.107 4.392 38.8937 4.168C38.6804 3.944 38.411 3.832 38.0857 3.832C37.755 3.832 37.483 3.944 37.2697 4.168C37.0617 4.38667 36.9577 4.66933 36.9577 5.016C36.9577 5.36267 37.0617 5.648 37.2697 5.872C37.483 6.09067 37.755 6.2 38.0857 6.2ZM41.3051 8.76L42.2251 6.736H41.9851L40.4411 3.032H41.5531L42.6651 5.824L43.8251 3.032H44.9131L42.3931 8.76H41.3051Z" fill="#001096"/>
            <g clipPath="url(#clip0_1923_23296)">
                <path d="M58.5141 6.02913C58.5644 6.37005 58.8092 6.77098 59.4839 6.77098C60.0578 6.77098 60.336 6.56623 60.336 6.23338C60.336 5.90053 60.142 5.75579 59.788 5.71292L58.5988 5.58482C57.5612 5.47387 56.9539 4.86819 56.9539 3.87872C56.9539 2.77779 57.7801 2.04401 59.4335 2.04401C61.2135 2.04401 61.9221 2.88874 61.9894 3.88679H60.3195C60.2687 3.51157 59.965 3.27253 59.442 3.27253C58.9783 3.27253 58.6577 3.44349 58.6577 3.75062C58.6577 3.99774 58.8097 4.18534 59.2141 4.21964L60.1844 4.30486C61.4918 4.41582 62.0397 5.04672 62.0397 6.0962C62.0397 7.21377 61.3477 7.999 59.4504 7.999C57.5532 7.999 56.9534 7.02667 56.8691 6.02862H58.5141V6.02913Z" fill="#001096" />
                <path d="M70.1965 5.28736V7.85484H68.5431V5.56019C68.5431 5.09925 68.3746 4.80069 67.9194 4.80069C67.4212 4.80069 67.2108 5.11639 67.2108 5.78159V7.85484H65.5824V5.56019C65.5824 5.09925 65.4133 4.80069 64.9581 4.80069C64.4605 4.80069 64.2496 5.11639 64.2496 5.78159V7.85484H62.5967V3.58932H64.2496V4.24644C64.5113 3.75171 64.9581 3.45265 65.6586 3.45265C66.3592 3.45265 66.8309 3.7855 67.0587 4.35689C67.3285 3.80265 67.7842 3.45265 68.5351 3.45265C69.6735 3.45265 70.197 4.16928 70.197 5.28736H70.1965Z" fill="#001096" />
                <path d="M70.9785 3.8535V2.18118H72.6319V3.8535H70.9785ZM70.9785 7.85476V4.2504H72.6319V7.85476H70.9785Z" fill="#001096" />
                <path d="M73.4121 7.85475V2.18167H75.065V7.85525H73.4121V7.85475Z" fill="#001096" />
                <path d="M78.7264 6.53958H80.3579C80.1968 7.3243 79.5696 7.99151 78.0179 7.99151C76.2294 7.99151 75.6221 6.8568 75.6221 5.71351C75.6221 4.48499 76.3391 3.45265 78.0179 3.45265C79.8653 3.45265 80.3629 4.59594 80.3629 5.77302C80.3629 5.91776 80.3539 6.05443 80.3374 6.13966H77.2336C77.3178 6.68583 77.5881 6.89059 78.0518 6.89059C78.3729 6.89059 78.6083 6.73526 78.7269 6.53908L78.7264 6.53958ZM77.2416 5.21877H78.8022C78.7519 4.77497 78.5404 4.52785 78.0428 4.52785C77.5791 4.52785 77.3348 4.70689 77.2416 5.21877Z" fill="#001096" />
                <path d="M83.5907 7.85476H81.8994L81.9034 2.18118H83.5902L83.5912 7.85476H83.5907Z" fill="#001096" />
                <path d="M89.9995 5.00535C89.9995 6.46434 89.1474 7.85475 87.3345 7.85475H84.3652V2.18167H87.3345C89.1479 2.18167 89.9995 3.54686 89.9995 5.00535ZM86.9376 6.5067C87.8401 6.5067 88.2364 5.99482 88.2364 5.00535C88.2364 4.01588 87.8226 3.52971 86.9376 3.52971H86.06V6.5067H86.9376Z" fill="#001096" />
                <path d="M52.2123 3.88737H48V7.86846H52.2123V3.88737Z" fill="#001096" />
                <path d="M53.2359 0C53.2165 0 53.1975 0.00201727 53.1786 0.00252159C53.1591 0.00252159 53.1402 0 53.1207 0C52.0457 0 51.0869 0.708567 51.0869 2.27044V3.8888H55.2882V2.27044C55.2882 0.708567 54.3174 0 53.2359 0Z" fill="#FF9B00" />
            </g>
            <defs>
                <clipPath id="clip0_1923_23296">
                    <rect width="42" height="8" fill="white" transform="translate(48)" />
                </clipPath>
            </defs>
          </svg>
        </p>
      `,this.attachShadow({mode:"open"}).appendChild(e.content.cloneNode(!0))}},f=u;var v=class s{static memoryLimit=1024e4;static supportedTypes=["image/jpeg","image/png"];static getHumanSize(e){let t=["B","kB","MB","GB","TB","PB","EB","ZB","YB"],i=Math.min(Math.floor(Math.log(e)/Math.log(1024)),t.length-1),a=e/1024**i;return i===0?`${e} bytes`:`${a.toFixed(0)} ${t[i]}`}static getData(e){return new Promise((t,i)=>{let a=new FileReader;a.onload=c=>{t(c.target.result)},a.onerror=()=>{i(new Error("An error occurred reading the file. Please check the file, and try again"))},a.readAsDataURL(e)})}static async retrieve(e){if(e.length>1)throw new Error("Only one file upload is permitted at a time");let t=e[0];if(!s.supportedTypes.includes(t.type))throw new Error("Unsupported file format. Please ensure that you are providing a JPG or PNG image");if(t.size>s.memoryLimit)throw new Error(`${t.name} is too large. Please ensure that the file is less than ${s.getHumanSize(s.memoryLimit)}.`);return await s.getData(t)}},w=v;var b="1.0.0";var I=8,M=396,x=527;function Z(){return`
    <link rel="preconnect" href="https://fonts.gstatic.com"> 
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap" rel="stylesheet">
  
    <style>
      :host {
        --color-active: #001096;
        --color-default: #2D2B2A;
        --color-disabled: #848282;
      }
  
      * {
        font-family: 'DM Sans', sans-serif;
      }
  
      [hidden] {
        display: none !important;
      }
  
      [disabled] {
        cursor: not-allowed !important;
        filter: grayscale(75%);
      }
  
      .visually-hidden {
        border: 0;
        clip: rect(1px 1px 1px 1px);
        clip: rect(1px, 1px, 1px, 1px);
        height: auto;
        margin: 0;
        overflow: hidden;
        padding: 0;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }
  
      img {
        height: auto;
        max-width: 100%;
        transform: scaleX(-1);
      }
  
      video {
        background-color: black;
      }
  
      a {
        color: currentColor;
        text-decoration: none;
      }
  
      svg {
        max-width: 100%;
      }
  
      .color-gray {
        color: #797979;
      }
  
      .color-red {
        color: red;
      }
  
      .color-richblue {
        color: #4E6577;
      }
  
      .color-richblue-shade {
        color: #0E1B42;
      }
  
      .color-digital-blue {
        color: #001096 !important;
      }
  
      .color-deep-blue {
        color: #001096;
      }
  
      .center {
        text-align: center;
        margin-left: auto;
        margin-right: auto;
      }
  
      .font-size-small {
        font-size: .75rem;
      }
  
      .font-size-large {
        font-size: 1.5rem;
      }
  
      .text-transform-uppercase {
        text-transform: uppercase;
      }
  
      [id*=-"screen"] {
        min-block-size: 100%;
      }
  
      [data-variant~="full-width"] {
        inline-size: 100%;
      }
  
      .flow > * + * {
        margin-top: 1rem;
      }
  
      .button {
        --button-color: var(--color-default);
        -webkit-appearance: none;
        appearance: none;
        border-radius: 2.5rem;
        border: 0;
        background-color: transparent;
        color: #fff;
        cursor: pointer;
        display: block;
        font-size: 18px;
        font-weight: 600;
        padding: .75rem 1.5rem;
        text-align: center;
      }
  
      .button:hover,
      .button:focus,
      .button:active {
        --button-color: var(--color-active);
      }
  
      .button:disabled {
        --button-color: var(--color-disabled);
      }
  
      .button[data-variant~='solid'] {
        background-color: var(--button-color);
        border: 2px solid var(--button-color);
      }
  
      .button[data-variant~='outline'] {
        color: var(--button-color);
        border: 2px solid var(--button-color);
      }
  
      .button[data-variant~='ghost'] {
        padding: 0px;
        color: var(--button-color);
        background-color: transparent;
      }
  
      .icon-btn {
        appearance: none;
        background: none;
        border: none;
        color: hsl(0deg 0% 94%);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 8px;
      }
      .justify-right {
        justify-content: end !important;
      }
      .nav {
        display: flex;
        justify-content: space-between;
      }
  
      .back-wrapper {
        display: flex;
        align-items: center;
      }
  
      .back-button {
        display: block !important;
      }
      .back-button-text {
        font-size: 11px;
        line-height: 11px;
        color: rgb(21, 31, 114);
      }
      .section {
        border: 1px solid #f4f4f4;
        border-radius: .5rem;
        margin-left: auto;
        margin-right: auto;
        max-width: 35ch;
        padding: 1rem;
      }
  
      .selfie-review-image {
        overflow: hidden;
        aspect-ratio: 1/1;
      }
  
      #review-image {
        scale: 1.75;
      }
  
      @media (max-aspect-ratio: 1/1) {
        #review-image {
          transform: scaleX(-1) translateY(-10%);
        }
      }
  
      .tips,
      .powered-by {
        align-items: center;
        border-radius: .25rem;
        color: #4E6577;
        display: flex;
        justify-content: center;
        letter-spacing: .075em;
      }
  
      .powered-by {
        box-shadow: 0px 2.57415px 2.57415px rgba(0, 0, 0, 0.06);
        display: inline-flex;
        font-size: .5rem;
      }
  
      .tips {
        margin-left: auto;
        margin-right: auto;
        max-width: 17rem;
      }
  
      .tips > * + *,
      .powered-by > * + * {
        display: inline-block;
        margin-left: .5em;
      }
  
      .powered-by .company {
        color: #18406D;
        font-weight: 700;
        letter-spacing: .15rem;
      }
  
      .logo-mark {
        background-color: #004071;
        display: inline-block;
        padding: .25em .5em;
      }
  
      .logo-mark svg {
        height: auto;
        justify-self: center;
        width: .75em;
      }
  
      @keyframes fadeInOut {
        12.5% {
          opacity: 0;
        }
  
        50% {
          opacity: 1;
        }
  
        87.5% {
          opacity: 0;
        }
      }
  
      .id-video-container.portrait {
        width: 100%;
        position: relative;
        height: calc(200px * 1.4);
      }
  
      .id-video-container.portrait video {
        width: calc(213px + 0.9rem);
        height: 100%;
        position: absolute;
        top: 239px;
        left: 161px;
        padding-bottom: calc((214px * 1.4) / 3);
        padding-top: calc((191px * 1.4) / 3);
        object-fit: cover;
  
        transform: translateX(-50%) translateY(-50%);
        z-index: 1;
        block-size: 100%;
      }
  
      .video-container,
      .id-video-container.landscape {
        position: relative;
        z-index: 1;
        width: 100%;
      }
  
      .video-container #smile-cta,
      .video-container video,
      .id-video-container.landscape video {
        left: 50%;
        min-width: auto;
        position: absolute;
        top: calc(50% - 3px);
        transform: translateX(-50%) translateY(50%);
      }
  
      .video-container #smile-cta {
        color: white;
        font-size: 2rem;
        font-weight: bold;
        opacity: 0;
        top: calc(50% - 3rem);
      }
  
      .video-container video {
        min-height: 100%;
        transform: scaleX(-1) translateX(50%) translateY(-50%);
      }
  
      .video-container .video {
        background-color: black;
        position: absolute;
        left: 50%;
        height: calc(100% - 6px);
        clip-path: ellipse(101px 118px);
      }
  
      .id-video-container.landscape {
        min-height: calc((2 * 10rem) + 198px);
        height: auto;
      }
  
      .id-video-container.portrait .image-frame-portrait {
        border-width: 0.9rem;
        border-color: rgba(0, 0, 0, 0.7);
        border-style: solid;
        height: auto;
        position: absolute;
        top: 80px;
        left: 47px;
        z-index: 2;
        width: 200px;
        height: calc(200px * 1.4);
      }
  
      .id-video-container.landscape .image-frame {
        border-width: 10rem 1rem;
        border-color: rgba(0, 0, 0, 0.7);
        border-style: solid;
        height: auto;
        width: 90%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
      }
  
      .id-video-container.landscape video {
        width: 100%;
        transform: translateX(-50%) translateY(-50%);
        z-index: 1;
        height: 100%;
        block-size: 100%;
      }
  
      .id-video-container.landscape img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        max-width: 90%;
      }
  
      #id-review-screen .id-video-container,
      #back-of-id-review-screen .id-video-container {
        background-color: rgba(0, 0, 0, 1);
      }
  
      #id-review-screen .id-video-container.portrait, #back-of-id-review-screen .id-video-container.portrait {
        height: calc((200px * 1.4) + 100px);
      }
      #id-review-screen .id-video-container.portrait img, #back-of-id-review-screen .id-video-container.portrait img {
        height: 280px;
        width: 200px;
        padding-top: 14px;
        transform: none;
      }
      .actions {
        background-color: rgba(0, 0, 0, .7);
        bottom: 0;
        display: flex;
        justify-content: space-between;
        padding: 1rem;
        position: absolute;
        width: 90%;
        z-index: 2;
      }
  
      #back-of-id-camera-screen .id-video-container.portrait .actions,
      #id-camera-screen .id-video-container.portrait .actions {
        top: 145%;
        width: calc(200px * 1.4);
      }
  
      #back-of-id-camera-screen .section.portrait, #id-camera-screen .section.portrait {
        min-height: calc((200px * 1.4) + 260px);
      }
  
      #id-entry-screen,
      #back-of-id-entry-screen {
        block-size: 45rem;
        padding-block: 2rem;
        display: flex;
        flex-direction: column;
        max-block-size: 100%;
        max-inline-size: 40ch;
      }
  
      #id-entry-screen header p {
        margin-block: 0 !important;
      }
  
      .document-tips {
        margin-block-start: 1.5rem;
        display: flex;
        align-items: center;
        text-align: initial;
      }
  
      .document-tips svg {
        flex-shrink: 0;
        margin-inline-end: 1rem;
      }
  
      .document-tips p {
        margin-block: 0;
      }
  
      .document-tips p:first-of-type {
        font-size; 1.875rem;
        font-weight: bold
      }
  
      [type='file'] {
        display: none;
      }
  
      .document-tips > * + * {
        margin-inline-start; 1em;
      }
    </style>
  
    <svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 259">
      <symbol id="image-frame">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0v69.605h13.349V13.349h56.256V0H0zM396 0h-69.605v13.349h56.256v56.256H396V0zM0 258.604V189h13.349v56.256h56.256v13.348H0zM396 258.604h-69.605v-13.348h56.256V189H396v69.604z" fill="#f00"/>
      </symbol>
    </svg>
  
    <svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 527">
      <symbol id="image-frame-portrait">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M 0.59 0.2 L 0.59 142.384 L 13.912 142.384 L 13.912 17 L 70.05 17 L 70.05 0.2 L 0.59 0.2 Z M 395.764 0.2 L 326.303 0.2 L 326.303 17 L 382.442 17 L 382.442 142.384 L 395.764 142.384 L 395.764 0.2 Z M 0.59 528.461 L 0.59 386.277 L 13.912 386.277 L 13.912 511.663 L 70.05 511.663 L 70.05 528.461 L 0.59 528.461 Z M 395.764 528.461 L 326.303 528.461 L 326.303 511.663 L 382.442 511.663 L 382.442 386.277 L 395.764 386.277 L 395.764 528.461 Z" fill="#f00"/>
      </symbol>
    </svg>
  
    <svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <symbol id="close-icon">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M.732.732a2.5 2.5 0 013.536 0L10 6.464 15.732.732a2.5 2.5 0 013.536 3.536L13.536 10l5.732 5.732a2.5 2.5 0 01-3.536 3.536L10 13.536l-5.732 5.732a2.5 2.5 0 11-3.536-3.536L6.464 10 .732 4.268a2.5 2.5 0 010-3.536z" fill="#fff"/>
      </symbol>
    </svg>
  
    <svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41">
      <symbol id="approve-icon">
        <circle cx="20.5" cy="20.5" r="20" stroke="#fff"/>
        <path d="M12.3 20.5l6.15 6.15 12.3-12.3" stroke="#fff" stroke-width="3.075" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      </symbol>
    </svg>
  
    <svg hidden fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 18">
      <symbol id="refresh-icon">
        <path d="M3.314 15.646a8.004 8.004 0 01-2.217-4.257 8.06 8.06 0 01.545-4.655l1.789.788a6.062 6.062 0 001.264 6.737 6.033 6.033 0 008.551 0c2.358-2.37 2.358-6.224 0-8.592a5.996 5.996 0 00-4.405-1.782l.662 2.354-3.128-.796-3.127-.796 2.25-2.324L7.748 0l.55 1.953a7.966 7.966 0 016.33 2.326 8.004 8.004 0 012.342 5.684 8.005 8.005 0 01-2.343 5.683A7.928 7.928 0 018.97 18a7.928 7.928 0 01-5.656-2.354z" fill="currentColor"/>
      </symbol>
    </svg>
  
    <div class='flow center'>
      <p class='color-red | center' id='error'>
      </p>
    </div>
  
    <div id='request-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav back-to-host-nav${this.hideBackToHost?" justify-right":""}">
          ${this.hideBackToHost?"":`
            <div class="back-wrapper back-to-host-wrapper">
              <button type='button' data-type='icon' id="back-button-exit" class="back-button back-button-exit icon-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                  <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
                  <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
                </svg>
              </button>
              <div class="back-button-text">Back</div>
            </div>
          `}
          <button data-type='icon' type='button' id='request-screen-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
      `:""}
      <div class='section | flow'>
        <p>
          We need access to your camera so that we can take selfie and proof-of-life images.
        </p>
  
        <button data-variant='solid' id='request-camera-access' class='button | center' type='button'>
          Request Camera Access
        </button>
  
        ${this.hideAttribution?"":`
          <powered-by-smile-id></powered-by-smile-id>
        `}
      </div>
    </div>
  
    <div hidden id='camera-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav back-to-host-nav${this.hideBackToHost?" justify-right":""}">
          ${this.hideBackToHost?"":`
            <div class="back-wrapper back-to-host-wrapper">
              <button type='button' data-type='icon' id="back-button" class="back-button icon-btn back-button-exit">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                  <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
                  <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
                </svg>
              </button>
              <div class="back-button-text">Back</div>
            </div>
          `}
          <button data-type='icon' type='button' id='camera-screen-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
      `:""}
      <h1>Take a Selfie</h1>
  
      <div class='section | flow'>
        <div class='video-container'>
          <div class='video'>
          </div>
          <svg id="image-outline" width="215" height="245" viewBox="0 0 215 245" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M210.981 122.838C210.981 188.699 164.248 241.268 107.55 241.268C50.853 241.268 4.12018 188.699 4.12018 122.838C4.12018 56.9763 50.853 4.40771 107.55 4.40771C164.248 4.40771 210.981 56.9763 210.981 122.838Z" stroke="var(--color-active)" stroke-width="7.13965"/>
          </svg>
          <p id='smile-cta' class='color-gray'>SMILE</p>
        </div>
  
        <small class='tips'>
          <svg width='44' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40">
            <path fill="#F8F8FA" fill-rule="evenodd" d="M17.44 0h4.2c4.92 0 7.56.68 9.95 1.96a13.32 13.32 0 015.54 5.54c1.27 2.39 1.95 5.02 1.95 9.94v4.2c0 4.92-.68 7.56-1.95 9.95a13.32 13.32 0 01-5.54 5.54c-2.4 1.27-5.03 1.95-9.95 1.95h-4.2c-4.92 0-7.55-.68-9.94-1.95a13.32 13.32 0 01-5.54-5.54C.68 29.19 0 26.56 0 21.64v-4.2C0 12.52.68 9.9 1.96 7.5A13.32 13.32 0 017.5 1.96C9.89.68 12.52 0 17.44 0z" clip-rule="evenodd"/>
            <path fill="#AEB6CB" d="M19.95 10.58a.71.71 0 000 1.43.71.71 0 000-1.43zm-5.54 2.3a.71.71 0 000 1.43.71.71 0 000-1.43zm11.08 0a.71.71 0 000 1.43.71.71 0 000-1.43zm-5.63 1.27a4.98 4.98 0 00-2.05 9.48v1.2a2.14 2.14 0 004.28 0v-1.2a4.99 4.99 0 00-2.23-9.48zm-7.75 4.27a.71.71 0 000 1.43.71.71 0 000-1.43zm15.68 0a.71.71 0 000 1.43.71.71 0 000-1.43z"/>
          </svg>
          <span>Tips: Put your face inside the oval frame and click to "take selfie"</span> </small>
  
        <button data-variant='solid' id='start-image-capture' class='button | center' type='button'>
          Take Selfie
        </button>
  
        ${this.hideAttribution?"":`
          <powered-by-smile-id></powered-by-smile-id>
        `}
      </div>
    </div>
  
    <div hidden id='review-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav justify-right">
          <button data-type='icon' type='button'  id='review-screen-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
      `:""}
      <h1>Review Selfie</h1>
  
      <div class='section | flow'>
        <div class='selfie-review-image'>
          <img
            alt='your selfie'
            id='review-image'
            src=''
            width='480'
            height='480'
          />
        </div>
  
        <p class='color-richblue-shade font-size-large'>
          Is this clear enough?
        </p>
  
        <p class='color-gray font-size-small'>
          Make sure your face is clear enough and the photo is not blurry
        </p>
  
        <button data-variant='solid' id='select-selfie' class='button | center' type='button'>
          Yes, use this one
        </button>
  
        <button data-variant='outline' id='restart-image-capture' class='button | center' type='button'>
          Re-take selfie
        </button>
      </div>
      ${this.hideAttribution?"":`
        <powered-by-smile-id></powered-by-smile-id>
      `}
    </div>
  
    <div hidden id='id-entry-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav">
          <div class="back-wrapper">
            <button type='button' data-type='icon' id="back-button-selfie" class="back-button icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
                <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
              </svg>
            </button>
            <div class="back-button-text">Back</div>
          </div>
          <button data-type='icon' type='button' id='id-entry-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
      `:""}
      <header>
        <svg xmlns="http://www.w3.org/2000/svg" width="51" height="78" fill="none">
          <g clip-path="url(#clip-path)">
            <path fill="#7FCBF5" d="m37.806 75.563.15-52.06c0-1.625-1.145-3.581-2.53-4.394L4.126 1.054C3.435.632 2.772.602 2.32.874l-1.265.721c-.452.271-.753.813-.753 1.625l-.15 52.06c0 1.626 1.144 3.581 2.53 4.394L33.98 77.73c.934.541 1.958.09 1.807.18l1.266-.722c.451-.27.753-.843.753-1.625Zm-1.266.782c0 .392-.06.722-.18.963.12-.27.18-.602.18-.963Z"/>
            <path fill="#7FCBF5" d="m39.07 74.84.151-52.06c0-1.625-1.144-3.58-2.53-4.393L5.39.361c-.692-.42-1.355-.45-1.807-.18L2.32.903c-.452.271-.753.813-.753 1.625l-.15 52.06c0 1.625 1.144 3.581 2.53 4.394l31.299 18.055c.934.542 1.958.09 1.807.181l1.266-.722c.451-.271.753-.843.753-1.625v-.03Zm-1.265.783c0 .391-.06.722-.18.963.12-.27.18-.602.18-.963Z"/>
            <path fill="#3B3837" d="M13.19 40.626c-.873-.06-1.687.03-2.44.27 1.597 2.498 3.525 4.635 5.603 6.2-1.265-2.077-2.35-4.274-3.163-6.47Zm9.88 5.687c-.813 1.264-1.897 2.227-3.192 2.799 2.078.842 4.006.933 5.633.27a24.828 24.828 0 0 0-2.44-3.069Zm-5.542-4.393c-1.054-.542-2.109-.933-3.133-1.144a34.476 34.476 0 0 0 3.133 6.23V41.92Zm1.265.722v5.085c1.265-.511 2.32-1.384 3.133-2.587a21.086 21.086 0 0 0-3.133-2.498Zm-7.35-10.593-4.609-2.648c.12 3.16 1.205 6.65 3.043 9.99.873-.3 1.807-.39 2.801-.33-.753-2.438-1.175-4.785-1.265-6.982m6.115 3.521-4.88-2.829c.06 2.017.452 4.153 1.175 6.41 1.205.21 2.44.662 3.705 1.324V35.6Zm6.145 3.52-4.88-2.828v4.905c1.235.783 2.47 1.776 3.675 2.95.723-1.415 1.115-3.1 1.205-5.026Zm5.844 3.371-4.609-2.648c-.09 2.107-.512 3.972-1.295 5.507a30.696 30.696 0 0 1 2.802 3.581c1.867-1.204 2.952-3.43 3.102-6.44ZM14.154 25.73c-.904 1.504-1.416 3.43-1.506 5.627l4.88 2.829v-5.748c-1.145-.722-2.26-1.625-3.374-2.678m8.043 4.634a13.447 13.447 0 0 1-3.404-1.264v5.748l4.88 2.829c-.09-2.287-.572-4.815-1.476-7.313Zm-11.869-9.088c-2.078 1.084-3.343 3.49-3.524 6.68l4.609 2.649c.09-2.378.633-4.454 1.566-6.079a31.138 31.138 0 0 1-2.65-3.25Zm15.725 9.058c-.813.21-1.717.27-2.65.18.933 2.709 1.445 5.387 1.536 7.855l4.608 2.648c-.15-3.37-1.385-7.222-3.464-10.713m-8.465-7.613c-1.084.42-2.018 1.113-2.801 2.046a19.827 19.827 0 0 0 2.771 2.166v-4.212m1.265.722v4.213c.934.481 1.838.842 2.772 1.053a33.855 33.855 0 0 0-2.771-5.266Zm-2.38-2.137c-1.867-.722-3.614-.903-5.12-.451.723.963 1.476 1.896 2.289 2.738.783-1.023 1.747-1.805 2.862-2.317m3.524 2.016a34.581 34.581 0 0 1 2.832 5.567c.813.09 1.566.06 2.29-.12-1.507-2.197-3.254-4.063-5.122-5.477m-8.886 33.945s-.271-.271-.271-.452V55.16c0-.15.12-.24.27-.15l14.008 8.065s.271.27.271.451v1.595c0 .15-.12.24-.27.15l-14.008-8.064Zm0-4.093s-.271-.27-.271-.451v-1.595c0-.15.12-.241.27-.15l14.008 8.064s.271.27.271.451v1.595c0 .15-.12.241-.27.15l-14.008-8.064Zm4.308-38.037s-.272-.27-.272-.451V13.03c0-.15.12-.241.271-.15l7.772 4.332s.272.271.272.452v1.595c0 .15-.12.24-.271.15l-7.773-4.333Zm2.71 34.546s-.09-.06-.15-.09h-.06c-3.193-1.956-6.236-5.146-8.525-9.028-2.47-4.183-3.826-8.667-3.826-12.639 0-4.152 1.596-7.222 4.338-8.395 2.26-.963 5.12-.572 8.103 1.083h.06s.09.09.151.12c.06.03.09.06.15.09h.06c2.983 1.806 5.845 4.725 8.074 8.276 2.741 4.363 4.278 9.238 4.278 13.391 0 3.942-1.386 6.861-3.886 8.185-2.32 1.234-5.362.933-8.555-.872h-.06s-.091-.09-.151-.12Zm15.756-29.731L2.707 1.896c-1.416-.812-2.56-.15-2.56 1.445l-.151 51.94c0 1.625 1.114 3.58 2.53 4.393L33.735 77.67c1.416.813 2.56.151 2.56-1.444l.15-51.91c0-1.625-1.144-3.58-2.53-4.393"/>
            <path fill="#7FCBF5" d="M16.353 47.096c-2.079-1.565-4.007-3.701-5.603-6.2.753-.24 1.566-.33 2.44-.27a35.724 35.724 0 0 0 3.163 6.47Zm3.494 2.016a7.52 7.52 0 0 0 3.193-2.799c.874.933 1.687 1.987 2.44 3.07-1.626.662-3.554.542-5.633-.27Zm-2.38-2.137a33.523 33.523 0 0 1-3.133-6.229c1.025.211 2.079.572 3.133 1.144v5.085Zm1.235.723v-5.086a19.828 19.828 0 0 1 3.163 2.498c-.813 1.203-1.897 2.076-3.163 2.588Zm-8.886-8.336c-1.838-3.31-2.922-6.8-3.043-9.99l4.61 2.648c.06 2.196.481 4.543 1.265 6.981a7.717 7.717 0 0 0-2.802.331m3.976-.21c-.692-2.227-1.084-4.394-1.174-6.41l4.88 2.828v4.905c-1.266-.662-2.5-1.113-3.706-1.324Zm8.646 4.995c-1.205-1.174-2.44-2.167-3.705-2.95v-4.904l4.91 2.828c-.09 1.926-.482 3.611-1.205 5.026Zm3.946 4.785a30.707 30.707 0 0 0-2.801-3.582c.783-1.564 1.205-3.4 1.295-5.507l4.609 2.649c-.15 3.009-1.235 5.236-3.103 6.44ZM12.647 31.296c.09-2.197.603-4.122 1.507-5.627 1.114 1.053 2.259 1.956 3.404 2.678v5.748l-4.91-2.829m6.115 3.521V29.04c1.174.602 2.29 1.024 3.434 1.264.873 2.528 1.386 5.026 1.476 7.313l-4.88-2.829m-11.96-6.891c.181-3.19 1.416-5.597 3.525-6.68a28.286 28.286 0 0 0 2.651 3.25c-.934 1.624-1.476 3.7-1.566 6.078l-4.61-2.648Zm18.105 10.442c-.09-2.468-.602-5.146-1.536-7.854.934.09 1.837 0 2.65-.18 2.08 3.49 3.314 7.342 3.465 10.712l-4.609-2.648m-7.35-11.435a19.841 19.841 0 0 1-2.772-2.167 6.523 6.523 0 0 1 2.802-2.046v4.213m1.235.722v-4.213a33.86 33.86 0 0 1 2.771 5.266c-.903-.21-1.837-.571-2.771-1.053Zm-5.212-4.032c-.813-.843-1.566-1.776-2.289-2.739 1.506-.451 3.284-.3 5.121.452-1.115.511-2.078 1.294-2.862 2.317m9.188 5.296a34.581 34.581 0 0 0-2.831-5.567c1.867 1.414 3.614 3.28 5.12 5.477-.722.15-1.476.18-2.289.12m-4.579-8.185s-.09-.06-.15-.09h-.06c-2.983-1.685-5.845-2.077-8.104-1.114-2.741 1.174-4.338 4.243-4.338 8.396 0 4.153 1.356 8.426 3.826 12.639 2.29 3.882 5.332 7.072 8.525 8.998h.06s.09.12.15.15c.061.03.091.06.152.09h.06c3.193 1.806 6.236 2.137 8.555.903 2.5-1.324 3.856-4.243 3.886-8.185 0-4.153-1.536-9.028-4.278-13.361-2.229-3.551-5.09-6.5-8.073-8.276h-.06s-.09-.09-.15-.12"/>
            <path fill="#43C15F" d="M40.668 50.165h-.03c-5.723 0-10.363 4.635-10.363 10.352v.03c0 5.717 4.64 10.352 10.363 10.352h.03c5.723 0 10.363-4.635 10.363-10.352v-.03c0-5.717-4.64-10.352-10.363-10.352Z"/>
            <path fill="#E5E7E7" d="m38.826 65.873-5.603-5.447 1.627-1.685 3.976 3.822 7.591-7.343 1.627 1.685-9.188 8.968h-.03Z"/>
          </g>
          <defs>
            <clipPath id="clip-path">
              <path fill="#fff" d="M0 0h51v78H0z"/>
            </clipPath>
          </defs>
        </svg>
        <h1>
          Submit${this.captureBackOfID?" the Front of":""} Your ID
        </h1>
        <p>
          We'll use it to verify your identity.
        </p>
        <p>
          Follow the tips below for the best results.
        </p>
      </header>
      <div class='flow'>
        <div class='document-tips'>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
            <g fill="#9394AB" clip-path="url(#clip)">
              <path fill-rule="evenodd" d="M26.827 16a10.827 10.827 0 1 1-21.655 0 10.827 10.827 0 0 1 21.655 0Z" clip-rule="evenodd"/>
              <path d="M16.51 3.825h-1.02L15.992 0l.518 3.825ZM22.53 5.707l-.884-.51 2.346-3.056-1.462 3.566ZM26.804 10.354l-.51-.883 3.557-1.479-3.047 2.362ZM28.183 16.51v-1.02l3.817.502-3.817.518ZM26.293 22.53l.51-.884 3.056 2.346-3.566-1.462ZM21.646 26.804l.884-.51 1.478 3.557-2.362-3.047ZM15.49 28.183h1.02L16.009 32l-.518-3.817ZM9.47 26.293l.884.51-2.346 3.056 1.462-3.566ZM5.196 21.646l.51.884-3.557 1.478 3.047-2.362ZM3.825 15.49v1.02L0 16.009l3.825-.518ZM5.707 9.47l-.51.884L2.14 8.008 5.707 9.47ZM10.354 5.196l-.883.51L7.992 2.15l2.362 3.047Z"/>
            </g>
            <defs>
              <clipPath id="clip">
                <path fill="#fff" d="M0 0h32v32H0z"/>
              </clipPath>
            </defs>
          </svg>
          <div>
            <p>Check the lighting</p>
            <p>
              Take your ID document image in a well-lit environment where it is easy to read, and free from glare on the card.
            </p>
          </div>
        </div>
        <div class='document-tips'>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" fill="none">
            <g fill="#9394AB" clip-path="url(#path)">
              <path d="M30.967 10.884H1.033A25.08 25.08 0 0 0 .65 12.06h30.702c-.11-.398-.238-.787-.384-1.176ZM31.515 12.696H.485c-.092.36-.165.721-.229 1.091h31.488c-.064-.37-.137-.73-.229-1.091ZM31.854 14.508H.146c-.045.333-.073.665-.1.997h31.908a18.261 18.261 0 0 0-.1-.997ZM32 16.767c0-.152 0-.294-.01-.446H.01c-.01.152-.01.294-.01.446 0 .152 0 .313.01.465h31.98c.01-.152.01-.313.01-.465ZM31.945 18.133H.055c.018.275.046.55.082.816h31.726c.036-.266.064-.54.082-.816ZM31.707 19.946H.293c.045.246.1.483.155.72h31.104c.055-.236.11-.474.155-.72ZM31.269 21.758H.73c.074.209.138.427.21.636h30.117c.073-.21.147-.427.21-.636ZM30.601 23.57H1.4l.247.541h28.708l.247-.54ZM29.687 25.383H2.322c.08.151.17.303.275.455h26.816l.274-.455ZM28.453 27.195H3.547l.284.36h24.338l.284-.36ZM26.816 29.007H5.184l.293.266h21.046l.293-.266ZM24.54 30.82H7.46l.284.18h16.512l.283-.18ZM28.873 6.898a16.377 16.377 0 0 0-.933-1.186A15.316 15.316 0 0 0 15.973 0 15.314 15.314 0 0 0 3.585 6.253h.027c-.164.218-.329.427-.484.645h25.746ZM29.12 7.268H2.88c-.293.437-.567.892-.823 1.357h27.886a13.617 13.617 0 0 0-.823-1.357ZM30.18 9.071H1.82c-.21.418-.403.845-.577 1.272h29.513a17.482 17.482 0 0 0-.575-1.272Z"/>
            </g>
            <defs>
              <clipPath id="path">
                <path fill="#fff" d="M0 0h32v31H0z"/>
              </clipPath>
            </defs>
          </svg>
          <div>
            <p>Make sure it's in focus</p>
            <p>
              Ensure the photo of the ID document you submit is not blurry: you should be able to read the text on the document.
            </p>
          </div>
        </div>
      </div>
      <div class='flow'>
        ${this.supportBothCaptureModes||this.documentCaptureModes==="camera"?`
          <button data-variant='solid full-width' class='button' type='button' id='take-photo'>
            Take Photo
          </button>
        `:""}
        ${this.supportBothCaptureModes||this.documentCaptureModes==="upload"?`
          <label id='upload-photo-label' data-variant='${this.supportBothCaptureModes?"outline":"solid"}' class='button'>
            <input type='file' onclick='this.value=null;' id='upload-photo' name='document' accept='image/png, image/jpeg' />
            <span>Upload Photo</span>
          </label>
        `:""}
      </div>
      ${this.hideAttribution?"":`
        <powered-by-smile-id></powered-by-smile-id>
      `}
    </div>
  
    <div hidden id='id-camera-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav">
          <div class="back-wrapper">
            <button type='button' data-type='icon' id="back-button-id-entry" class="back-button icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
                <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
              </svg>
            </button>
            <div class="back-button-text">Back</div>
          </div>
          <button data-type='icon' type='button' id='id-camera-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
      `:""}
      <h1>Take ID Card Photo</h1>
      <div class='section | flow ${this.isPortraitCaptureView?"portrait":"landscape"}'>
        <div class='id-video-container ${this.isPortraitCaptureView?"portrait":"landscape"}'>
          <svg class="image-frame" fill="none" height="259" width="396" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 259" ${this.isPortraitCaptureView?"hidden":""}>
            <use href='#image-frame' />
          </svg>
  
          <svg class="image-frame-portrait" fill="none" height="527" width="396" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 527" ${this.isPortraitCaptureView?"":"hidden"}>
            <use href='#image-frame-portrait' />
          </svg>
  
          <div class='actions' hidden>
            <button id='capture-id-image' class='button icon-btn | center' type='button'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="60" width="60">
                <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="3" />
              </svg>
              <span class='visually-hidden'>Capture</span>
            </button>
          </div>
        </div>
  
        ${this.hideAttribution?"":`
          <powered-by-smile-id></powered-by-smile-id>
        `}
      </div>
    </div>
  
    <div hidden id='id-review-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav justify-right">
          <button data-type='icon' type='button'  id='id-review-screen-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
      `:""}
      <h1>Review ID Card</h1>
      <div class='section | flow'>
        <div class='id-video-container ${this.isPortraitCaptureView?"portrait":"landscape"}'>
          <div class='actions'>
            <button id='re-capture-id-image' class='button icon-btn' type='button'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="40" width="40" viewBox='0 0 17 18'>
                <path d="M3.314 15.646a8.004 8.004 0 01-2.217-4.257 8.06 8.06 0 01.545-4.655l1.789.788a6.062 6.062 0 001.264 6.737 6.033 6.033 0 008.551 0c2.358-2.37 2.358-6.224 0-8.592a5.996 5.996 0 00-4.405-1.782l.662 2.354-3.128-.796-3.127-.796 2.25-2.324L7.748 0l.55 1.953a7.966 7.966 0 016.33 2.326 8.004 8.004 0 012.342 5.684 8.005 8.005 0 01-2.343 5.683A7.928 7.928 0 018.97 18a7.928 7.928 0 01-5.656-2.354z" fill="currentColor"/>
              </svg>
              <span class='visually-hidden'>Re-Capture</span>
            </button>
            <button id='select-id-image' class='button icon-btn' type='button'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox='0 0 41 41' height="40" width="40">
                <circle cx="20.5" cy="20.5" r="20" stroke="#fff"/>
                <path d="M12.3 20.5l6.15 6.15 12.3-12.3" stroke="#fff" stroke-width="3.075" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class='visually-hidden'>Accept Image</span>
            </button>
          </div>
  
          <img
            alt='your ID card'
            id='id-review-image'
            src=''
            width='396'
          />
        </div>
  
        ${this.hideAttribution?"":`
          <powered-by-smile-id></powered-by-smile-id>
        `}
      </div>
    </div>
  
    <div hidden id='back-of-id-entry-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav">
          <div class="back-wrapper">
            <button type='button' data-type='icon' id="back-button-id-image" class="back-button icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
                <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
              </svg>
            </button>
            <div class="back-button-text">Back</div>
          </div>
          <button data-type='icon' type='button' id='back-id-entry-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
        `:""}
      <header>
        <svg xmlns="http://www.w3.org/2000/svg" width="51" height="78" fill="none">
          <g clip-path="url(#clip-path)">
            <path fill="#7FCBF5" d="m37.806 75.563.15-52.06c0-1.625-1.145-3.581-2.53-4.394L4.126 1.054C3.435.632 2.772.602 2.32.874l-1.265.721c-.452.271-.753.813-.753 1.625l-.15 52.06c0 1.626 1.144 3.581 2.53 4.394L33.98 77.73c.934.541 1.958.09 1.807.18l1.266-.722c.451-.27.753-.843.753-1.625Zm-1.266.782c0 .392-.06.722-.18.963.12-.27.18-.602.18-.963Z"/>
            <path fill="#7FCBF5" d="m39.07 74.84.151-52.06c0-1.625-1.144-3.58-2.53-4.393L5.39.361c-.692-.42-1.355-.45-1.807-.18L2.32.903c-.452.271-.753.813-.753 1.625l-.15 52.06c0 1.625 1.144 3.581 2.53 4.394l31.299 18.055c.934.542 1.958.09 1.807.181l1.266-.722c.451-.271.753-.843.753-1.625v-.03Zm-1.265.783c0 .391-.06.722-.18.963.12-.27.18-.602.18-.963Z"/>
            <path fill="#3B3837" d="M13.19 40.626c-.873-.06-1.687.03-2.44.27 1.597 2.498 3.525 4.635 5.603 6.2-1.265-2.077-2.35-4.274-3.163-6.47Zm9.88 5.687c-.813 1.264-1.897 2.227-3.192 2.799 2.078.842 4.006.933 5.633.27a24.828 24.828 0 0 0-2.44-3.069Zm-5.542-4.393c-1.054-.542-2.109-.933-3.133-1.144a34.476 34.476 0 0 0 3.133 6.23V41.92Zm1.265.722v5.085c1.265-.511 2.32-1.384 3.133-2.587a21.086 21.086 0 0 0-3.133-2.498Zm-7.35-10.593-4.609-2.648c.12 3.16 1.205 6.65 3.043 9.99.873-.3 1.807-.39 2.801-.33-.753-2.438-1.175-4.785-1.265-6.982m6.115 3.521-4.88-2.829c.06 2.017.452 4.153 1.175 6.41 1.205.21 2.44.662 3.705 1.324V35.6Zm6.145 3.52-4.88-2.828v4.905c1.235.783 2.47 1.776 3.675 2.95.723-1.415 1.115-3.1 1.205-5.026Zm5.844 3.371-4.609-2.648c-.09 2.107-.512 3.972-1.295 5.507a30.696 30.696 0 0 1 2.802 3.581c1.867-1.204 2.952-3.43 3.102-6.44ZM14.154 25.73c-.904 1.504-1.416 3.43-1.506 5.627l4.88 2.829v-5.748c-1.145-.722-2.26-1.625-3.374-2.678m8.043 4.634a13.447 13.447 0 0 1-3.404-1.264v5.748l4.88 2.829c-.09-2.287-.572-4.815-1.476-7.313Zm-11.869-9.088c-2.078 1.084-3.343 3.49-3.524 6.68l4.609 2.649c.09-2.378.633-4.454 1.566-6.079a31.138 31.138 0 0 1-2.65-3.25Zm15.725 9.058c-.813.21-1.717.27-2.65.18.933 2.709 1.445 5.387 1.536 7.855l4.608 2.648c-.15-3.37-1.385-7.222-3.464-10.713m-8.465-7.613c-1.084.42-2.018 1.113-2.801 2.046a19.827 19.827 0 0 0 2.771 2.166v-4.212m1.265.722v4.213c.934.481 1.838.842 2.772 1.053a33.855 33.855 0 0 0-2.771-5.266Zm-2.38-2.137c-1.867-.722-3.614-.903-5.12-.451.723.963 1.476 1.896 2.289 2.738.783-1.023 1.747-1.805 2.862-2.317m3.524 2.016a34.581 34.581 0 0 1 2.832 5.567c.813.09 1.566.06 2.29-.12-1.507-2.197-3.254-4.063-5.122-5.477m-8.886 33.945s-.271-.271-.271-.452V55.16c0-.15.12-.24.27-.15l14.008 8.065s.271.27.271.451v1.595c0 .15-.12.24-.27.15l-14.008-8.064Zm0-4.093s-.271-.27-.271-.451v-1.595c0-.15.12-.241.27-.15l14.008 8.064s.271.27.271.451v1.595c0 .15-.12.241-.27.15l-14.008-8.064Zm4.308-38.037s-.272-.27-.272-.451V13.03c0-.15.12-.241.271-.15l7.772 4.332s.272.271.272.452v1.595c0 .15-.12.24-.271.15l-7.773-4.333Zm2.71 34.546s-.09-.06-.15-.09h-.06c-3.193-1.956-6.236-5.146-8.525-9.028-2.47-4.183-3.826-8.667-3.826-12.639 0-4.152 1.596-7.222 4.338-8.395 2.26-.963 5.12-.572 8.103 1.083h.06s.09.09.151.12c.06.03.09.06.15.09h.06c2.983 1.806 5.845 4.725 8.074 8.276 2.741 4.363 4.278 9.238 4.278 13.391 0 3.942-1.386 6.861-3.886 8.185-2.32 1.234-5.362.933-8.555-.872h-.06s-.091-.09-.151-.12Zm15.756-29.731L2.707 1.896c-1.416-.812-2.56-.15-2.56 1.445l-.151 51.94c0 1.625 1.114 3.58 2.53 4.393L33.735 77.67c1.416.813 2.56.151 2.56-1.444l.15-51.91c0-1.625-1.144-3.58-2.53-4.393"/>
            <path fill="#7FCBF5" d="M16.353 47.096c-2.079-1.565-4.007-3.701-5.603-6.2.753-.24 1.566-.33 2.44-.27a35.724 35.724 0 0 0 3.163 6.47Zm3.494 2.016a7.52 7.52 0 0 0 3.193-2.799c.874.933 1.687 1.987 2.44 3.07-1.626.662-3.554.542-5.633-.27Zm-2.38-2.137a33.523 33.523 0 0 1-3.133-6.229c1.025.211 2.079.572 3.133 1.144v5.085Zm1.235.723v-5.086a19.828 19.828 0 0 1 3.163 2.498c-.813 1.203-1.897 2.076-3.163 2.588Zm-8.886-8.336c-1.838-3.31-2.922-6.8-3.043-9.99l4.61 2.648c.06 2.196.481 4.543 1.265 6.981a7.717 7.717 0 0 0-2.802.331m3.976-.21c-.692-2.227-1.084-4.394-1.174-6.41l4.88 2.828v4.905c-1.266-.662-2.5-1.113-3.706-1.324Zm8.646 4.995c-1.205-1.174-2.44-2.167-3.705-2.95v-4.904l4.91 2.828c-.09 1.926-.482 3.611-1.205 5.026Zm3.946 4.785a30.707 30.707 0 0 0-2.801-3.582c.783-1.564 1.205-3.4 1.295-5.507l4.609 2.649c-.15 3.009-1.235 5.236-3.103 6.44ZM12.647 31.296c.09-2.197.603-4.122 1.507-5.627 1.114 1.053 2.259 1.956 3.404 2.678v5.748l-4.91-2.829m6.115 3.521V29.04c1.174.602 2.29 1.024 3.434 1.264.873 2.528 1.386 5.026 1.476 7.313l-4.88-2.829m-11.96-6.891c.181-3.19 1.416-5.597 3.525-6.68a28.286 28.286 0 0 0 2.651 3.25c-.934 1.624-1.476 3.7-1.566 6.078l-4.61-2.648Zm18.105 10.442c-.09-2.468-.602-5.146-1.536-7.854.934.09 1.837 0 2.65-.18 2.08 3.49 3.314 7.342 3.465 10.712l-4.609-2.648m-7.35-11.435a19.841 19.841 0 0 1-2.772-2.167 6.523 6.523 0 0 1 2.802-2.046v4.213m1.235.722v-4.213a33.86 33.86 0 0 1 2.771 5.266c-.903-.21-1.837-.571-2.771-1.053Zm-5.212-4.032c-.813-.843-1.566-1.776-2.289-2.739 1.506-.451 3.284-.3 5.121.452-1.115.511-2.078 1.294-2.862 2.317m9.188 5.296a34.581 34.581 0 0 0-2.831-5.567c1.867 1.414 3.614 3.28 5.12 5.477-.722.15-1.476.18-2.289.12m-4.579-8.185s-.09-.06-.15-.09h-.06c-2.983-1.685-5.845-2.077-8.104-1.114-2.741 1.174-4.338 4.243-4.338 8.396 0 4.153 1.356 8.426 3.826 12.639 2.29 3.882 5.332 7.072 8.525 8.998h.06s.09.12.15.15c.061.03.091.06.152.09h.06c3.193 1.806 6.236 2.137 8.555.903 2.5-1.324 3.856-4.243 3.886-8.185 0-4.153-1.536-9.028-4.278-13.361-2.229-3.551-5.09-6.5-8.073-8.276h-.06s-.09-.09-.15-.12"/>
            <path fill="#43C15F" d="M40.668 50.165h-.03c-5.723 0-10.363 4.635-10.363 10.352v.03c0 5.717 4.64 10.352 10.363 10.352h.03c5.723 0 10.363-4.635 10.363-10.352v-.03c0-5.717-4.64-10.352-10.363-10.352Z"/>
            <path fill="#E5E7E7" d="m38.826 65.873-5.603-5.447 1.627-1.685 3.976 3.822 7.591-7.343 1.627 1.685-9.188 8.968h-.03Z"/>
          </g>
          <defs>
            <clipPath id="clip-path">
              <path fill="#fff" d="M0 0h51v78H0z"/>
            </clipPath>
          </defs>
        </svg>
        <h1>
          Submit Back of ID
        </h1>
        <p>
          Submit back of ID document
        </p>
        <p>
          Follow the tips below for the best results.
        </p>
      </header>
      <div class='flow'>
        <div class='document-tips'>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
            <g fill="#9394AB" clip-path="url(#clip)">
              <path fill-rule="evenodd" d="M26.827 16a10.827 10.827 0 1 1-21.655 0 10.827 10.827 0 0 1 21.655 0Z" clip-rule="evenodd"/>
              <path d="M16.51 3.825h-1.02L15.992 0l.518 3.825ZM22.53 5.707l-.884-.51 2.346-3.056-1.462 3.566ZM26.804 10.354l-.51-.883 3.557-1.479-3.047 2.362ZM28.183 16.51v-1.02l3.817.502-3.817.518ZM26.293 22.53l.51-.884 3.056 2.346-3.566-1.462ZM21.646 26.804l.884-.51 1.478 3.557-2.362-3.047ZM15.49 28.183h1.02L16.009 32l-.518-3.817ZM9.47 26.293l.884.51-2.346 3.056 1.462-3.566ZM5.196 21.646l.51.884-3.557 1.478 3.047-2.362ZM3.825 15.49v1.02L0 16.009l3.825-.518ZM5.707 9.47l-.51.884L2.14 8.008 5.707 9.47ZM10.354 5.196l-.883.51L7.992 2.15l2.362 3.047Z"/>
            </g>
            <defs>
              <clipPath id="clip">
                <path fill="#fff" d="M0 0h32v32H0z"/>
              </clipPath>
            </defs>
          </svg>
          <div>
            <p>Check the lighting</p>
            <p>
              Take your ID document image in a well-lit environment where it is easy to read, and free from glare on the card.
            </p>
          </div>
        </div>
        <div class='document-tips'>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="31" fill="none">
            <g fill="#9394AB" clip-path="url(#path)">
              <path d="M30.967 10.884H1.033A25.08 25.08 0 0 0 .65 12.06h30.702c-.11-.398-.238-.787-.384-1.176ZM31.515 12.696H.485c-.092.36-.165.721-.229 1.091h31.488c-.064-.37-.137-.73-.229-1.091ZM31.854 14.508H.146c-.045.333-.073.665-.1.997h31.908a18.261 18.261 0 0 0-.1-.997ZM32 16.767c0-.152 0-.294-.01-.446H.01c-.01.152-.01.294-.01.446 0 .152 0 .313.01.465h31.98c.01-.152.01-.313.01-.465ZM31.945 18.133H.055c.018.275.046.55.082.816h31.726c.036-.266.064-.54.082-.816ZM31.707 19.946H.293c.045.246.1.483.155.72h31.104c.055-.236.11-.474.155-.72ZM31.269 21.758H.73c.074.209.138.427.21.636h30.117c.073-.21.147-.427.21-.636ZM30.601 23.57H1.4l.247.541h28.708l.247-.54ZM29.687 25.383H2.322c.08.151.17.303.275.455h26.816l.274-.455ZM28.453 27.195H3.547l.284.36h24.338l.284-.36ZM26.816 29.007H5.184l.293.266h21.046l.293-.266ZM24.54 30.82H7.46l.284.18h16.512l.283-.18ZM28.873 6.898a16.377 16.377 0 0 0-.933-1.186A15.316 15.316 0 0 0 15.973 0 15.314 15.314 0 0 0 3.585 6.253h.027c-.164.218-.329.427-.484.645h25.746ZM29.12 7.268H2.88c-.293.437-.567.892-.823 1.357h27.886a13.617 13.617 0 0 0-.823-1.357ZM30.18 9.071H1.82c-.21.418-.403.845-.577 1.272h29.513a17.482 17.482 0 0 0-.575-1.272Z"/>
            </g>
            <defs>
              <clipPath id="path">
                <path fill="#fff" d="M0 0h32v31H0z"/>
              </clipPath>
            </defs>
          </svg>
          <div>
            <p>Make sure it's in focus</p>
            <p>
              Ensure the photo of the ID document you submit is not blurry: you should be able to read the text on the document.
            </p>
          </div>
        </div>
      </div>
      <br />
      <div class='flow'>
        ${this.documentType?"":`
          <button data-variant='ghost full-width' class='button' type='button' id='skip-this-step'>
            Skip this step
          </button>
        `}
        ${this.supportBothCaptureModes||this.documentCaptureModes==="camera"?`
          <button data-variant='solid full-width' class='button' type='button' id='take-photo'>
            Take Photo
          </button>
        `:""}
        ${this.supportBothCaptureModes||this.documentCaptureModes==="upload"?`
          <label data-variant='${this.supportBothCaptureModes?"outline":"solid"}' class='button'>
            <input type='file' id='upload-photo' name='document' accept='image/png, image/jpeg' />
            <span>Upload Photo</span>
          </label>
        `:""}
      </div>
      ${this.hideAttribution?"":`
        <powered-by-smile-id></powered-by-smile-id>
      `}
    </div>
  
    <div hidden id='back-of-id-camera-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav">
          <div class="back-wrapper">
            <button type='button' data-type='icon' id="back-button-back-id-entry" class="back-button icon-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
                <path fill="#001096" d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
              </svg>
            </button>
            <div class="back-button-text">Back</div>
          </div>
          <button data-type='icon' type='button' id='back-id-camera-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
      `:""}
      <h1>Take Back of ID Card Photo</h1>
      <div class='section | flow ${this.isPortraitCaptureView?"portrait":"landscape"}'>
        <div class='id-video-container ${this.isPortraitCaptureView?"portrait":"landscape"}'>
          <svg class="image-frame" fill="none" height="259" width="396" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 259" ${this.isPortraitCaptureView?"hidden":""}>
            <use href='#image-frame' />
          </svg>
  
          <svg class="image-frame-portrait" fill="none" height="527" width="396" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 396 527" ${this.isPortraitCaptureView?"":"hidden"}>
            <use href='#image-frame-portrait' />
          </svg>
  
          <div class='actions' hidden>
            <button id='capture-back-of-id-image' class='button icon-btn | center' type='button'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="60" width="60">
                <circle cx="30" cy="30" r="27" stroke="currentColor" stroke-width="3" />
              </svg>
              <span class='visually-hidden'>Capture</span>
            </button>
          </div>
        </div>
  
        ${this.hideAttribution?"":`
          <powered-by-smile-id></powered-by-smile-id>
        `}
      </div>
    </div>
  
    <div hidden id='back-of-id-review-screen' class='flow center'>
      ${this.showNavigation?`
        <div class="nav justify-right">
          <button data-type='icon' type='button' id='back-review-screen-close' class='close-iframe icon-btn'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
              <path fill="#DBDBC4" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" opacity=".4"/>
              <path fill="#91190F" d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"/>
            </svg>
            <span class='visually-hidden'>Close SmileIdentity Verification frame</span>
          </button>
        </div>
      `:""}
      <h1>Review Back of ID Card Photo</h1>
      <div class='section | flow'>
        <div class='id-video-container ${this.isPortraitCaptureView?"portrait":"landscape"}'>
          <div class='actions'>
            <button id='re-capture-back-of-id-image' class='button icon-btn' type='button'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="40" width="40" viewBox='0 0 17 18'>
                <path d="M3.314 15.646a8.004 8.004 0 01-2.217-4.257 8.06 8.06 0 01.545-4.655l1.789.788a6.062 6.062 0 001.264 6.737 6.033 6.033 0 008.551 0c2.358-2.37 2.358-6.224 0-8.592a5.996 5.996 0 00-4.405-1.782l.662 2.354-3.128-.796-3.127-.796 2.25-2.324L7.748 0l.55 1.953a7.966 7.966 0 016.33 2.326 8.004 8.004 0 012.342 5.684 8.005 8.005 0 01-2.343 5.683A7.928 7.928 0 018.97 18a7.928 7.928 0 01-5.656-2.354z" fill="currentColor"/>
              </svg>
              <span class='visually-hidden'>Re-Capture</span>
            </button>
            <button id='select-back-of-id-image' class='button icon-btn' type='button'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox='0 0 41 41' height="40" width="40">
                <circle cx="20.5" cy="20.5" r="20" stroke="#fff"/>
                <path d="M12.3 20.5l6.15 6.15 12.3-12.3" stroke="#fff" stroke-width="3.075" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class='visually-hidden'>Accept Image</span>
            </button>
          </div>
  
          <img
            alt='your ID card'
            id='back-of-id-review-image'
            src=''
            width='396'
          />
        </div>
  
        ${this.hideAttribution?"":`
          <powered-by-smile-id></powered-by-smile-id>
        `}
      </div>
    </div>
  
    <div hidden id='thanks-screen' class='flow center'>
      <div class='section | flow'>
        <h1>Thank you</h1>
  
        ${this.hideAttribution?"":`
          <powered-by-smile-id></powered-by-smile-id>
        `}
      </div>
    </div>
    `}function D(s,e=I){let t=[];if(s<e)throw new Error("SmartCameraWeb: Minimum required no of frames is ",e);let i=e-1,a=Math.floor(s/i),c=1;for(let o=0;o<s;o+=a)t.length<8?t.push(o):(t[c]=o,t.sort((n,d)=>n-d),c+=1);let r=s-1;return t.length<8&&!t.includes(r)&&t.push(r),t}function B(){let s=navigator.userAgent.match(/SM-[N|G]\d{3}/);if(!s)return!1;let e=parseInt(s[0].match(/\d{3}/)[0],10),t=970;return!Number.isNaN(e)&&e>=t}var g=class extends HTMLElement{constructor(){super(),this.scwTemplateString=Z.bind(this),this.render=()=>this.scwTemplateString(),this.attachShadow({mode:"open"}),this.activeScreen=null}setActiveScreen(e){this.activeScreen.hidden=!0,e.hidden=!1,this.activeScreen=e}connectedCallback(){if(this.shadowRoot.innerHTML=this.render(),"mediaDevices"in navigator&&"getUserMedia"in navigator.mediaDevices)this.setUpEventListeners();else{let e=document.createElement("h1");e.classList.add("error-message"),e.textContent="Your browser does not support this integration",this.shadowRoot.innerHTML=e}}disconnectedCallback(){this.activeScreen&&(this.activeScreen.hidden=!0),this.activeScreen=null,this.shadowRoot.innerHTML=""}static get observedAttributes(){return["document-capture-modes","document-type","hide-back-to-host","show-navigation"]}attributeChangedCallback(e){switch(e){case"document-capture-modes":case"document-type":case"hide-back-to-host":case"show-navigation":this.shadowRoot.innerHTML=this.render(),this.setUpEventListeners();break;default:break}}setUpEventListeners(){this.backOfIDCameraScreen=this.shadowRoot.querySelector("#back-of-id-camera-screen"),this.backOfIdEntryScreen=this.shadowRoot.querySelector("#back-of-id-entry-screen"),this.backOfIDReviewImage=this.shadowRoot.querySelector("#back-of-id-review-image"),this.backOfIDReviewScreen=this.shadowRoot.querySelector("#back-of-id-review-screen"),this.cameraScreen=this.shadowRoot.querySelector("#camera-screen"),this.captureBackOfIDImage=this.shadowRoot.querySelector("#capture-back-of-id-image"),this.captureIDImage=this.shadowRoot.querySelector("#capture-id-image"),this.errorMessage=this.shadowRoot.querySelector("#error"),this.IDCameraScreen=this.shadowRoot.querySelector("#id-camera-screen"),this.idEntryScreen=this.shadowRoot.querySelector("#id-entry-screen"),this.IDReviewImage=this.shadowRoot.querySelector("#id-review-image"),this.IDReviewScreen=this.shadowRoot.querySelector("#id-review-screen"),this.imageOutline=this.shadowRoot.querySelector("#image-outline path"),this.reCaptureBackOfIDImage=this.shadowRoot.querySelector("#re-capture-back-of-id-image"),this.reCaptureIDImage=this.shadowRoot.querySelector("#re-capture-id-image"),this.requestScreen=this.shadowRoot.querySelector("#request-screen"),this.reStartImageCapture=this.shadowRoot.querySelector("#restart-image-capture"),this.reviewImage=this.shadowRoot.querySelector("#review-image"),this.reviewScreen=this.shadowRoot.querySelector("#review-screen"),this.selectBackOfIDImage=this.shadowRoot.querySelector("#select-back-of-id-image"),this.selectIDImage=this.shadowRoot.querySelector("#select-id-image"),this.selectSelfie=this.shadowRoot.querySelector("#select-selfie"),this.skipBackOfDocumentPhotoButton=this.backOfIdEntryScreen.querySelector("#skip-this-step"),this.smileCTA=this.shadowRoot.querySelector("#smile-cta"),this.startImageCapture=this.shadowRoot.querySelector("#start-image-capture"),this.takeBackOfDocumentPhotoButton=this.backOfIdEntryScreen.querySelector("#take-photo"),this.takeDocumentPhotoButton=this.idEntryScreen.querySelector("#take-photo"),this.thanksScreen=this.shadowRoot.querySelector("#thanks-screen"),this.uploadBackOfDocumentPhotoButton=this.backOfIdEntryScreen.querySelector("#upload-photo"),this.uploadDocumentPhotoButton=this.idEntryScreen.querySelector("#upload-photo"),this.videoContainer=this.shadowRoot.querySelector(".video-container > .video"),this.activeScreen=this.requestScreen,this.shadowRoot.querySelector("#request-camera-access").addEventListener("click",()=>this.init()),this.showNavigation&&(this.shadowRoot.querySelectorAll(".back-button-exit").forEach(i=>{i.addEventListener("click",()=>{this._backAndExit()})}),this.shadowRoot.querySelectorAll(".close-iframe").forEach(i=>{i.addEventListener("click",()=>{this._exitSmartCamera()})})),this.takeDocumentPhotoButton&&this.takeDocumentPhotoButton.addEventListener("click",()=>this._startIDCamera()),this.skipBackOfDocumentPhotoButton&&this.skipBackOfDocumentPhotoButton.addEventListener("click",()=>this._skipBackDocument()),this.takeBackOfDocumentPhotoButton&&this.takeBackOfDocumentPhotoButton.addEventListener("click",()=>this._startIDCamera()),this.uploadDocumentPhotoButton&&this.uploadDocumentPhotoButton.addEventListener("change",e=>this._uploadDocument(e)),this.uploadBackOfDocumentPhotoButton&&this.uploadBackOfDocumentPhotoButton.addEventListener("change",e=>this._uploadDocument(e)),this.backToBackIdEntryButton=this.shadowRoot.querySelector("#back-button-back-id-entry"),this.backToIdEntryButton=this.shadowRoot.querySelector("#back-button-id-entry"),this.backToIdImageButton=this.shadowRoot.querySelector("#back-button-id-image"),this.backToSelfie=this.shadowRoot.querySelector("#back-button-selfie"),this.backToSelfie&&this.backToSelfie.addEventListener("click",()=>{this._reStartImageCapture()}),this.backToIdEntryButton&&this.backToIdEntryButton.addEventListener("click",()=>{this.setActiveScreen(this.idEntryScreen)}),this.backToBackIdEntryButton&&this.backToBackIdEntryButton.addEventListener("click",()=>{this.setActiveScreen(this.backOfIdEntryScreen)}),this.backToIdImageButton&&this.backToIdImageButton.addEventListener("click",()=>{this.setActiveScreen(this.IDReviewScreen)}),this.startImageCapture.addEventListener("click",()=>{this._startImageCapture()}),this.selectSelfie.addEventListener("click",()=>{this._selectSelfie()}),this.selectIDImage.addEventListener("click",()=>{this._selectIDImage()}),this.selectBackOfIDImage.addEventListener("click",()=>{this._selectIDImage(!0)}),this.captureIDImage.addEventListener("click",()=>{this._captureIDImage()}),this.captureBackOfIDImage.addEventListener("click",()=>{this._captureIDImage()}),this.reStartImageCapture.addEventListener("click",()=>{this._reStartImageCapture()}),this.reCaptureIDImage.addEventListener("click",()=>{this._reCaptureIDImage()}),this.reCaptureBackOfIDImage.addEventListener("click",()=>{this._reCaptureIDImage()})}init(){this._videoStreamDurationInMS=7800,this._imageCaptureIntervalInMS=200,this._data={images:[],partner_params:{libraryVersion:b,permissionGranted:!1}},this._rawImages=[],navigator.mediaDevices.getUserMedia({audio:!1,video:!0}).then(e=>{this.handleSuccess(e)}).catch(e=>{this.handleError(e)})}reset(){this.disconnectedCallback(),this.connectedCallback()}resetErrorMessage(){this.errorMessage.textContent=""}handleSuccess(e){let t=!!this.videoContainer.querySelector("video"),i=t?this.videoContainer.querySelector("video"):document.createElement("video");i.autoplay=!0,i.playsInline=!0,i.muted=!0,"srcObject"in i?i.srcObject=e:i.src=window.URL.createObjectURL(e),i.play(),t||this.videoContainer.prepend(i),this._data.partner_params.permissionGranted=!0,this.setActiveScreen(this.cameraScreen),this._stream=e,this._video=i}handleIDStream(e){let t=this.activeScreen===this.IDCameraScreen?!!this.IDCameraScreen.querySelector("video"):!!this.backOfIDCameraScreen.querySelector("video"),i=null;t?this.activeScreen===this.IDCameraScreen?i=this.IDCameraScreen.querySelector("video"):i=this.backOfIDCameraScreen.querySelector("video"):i=document.createElement("video"),i.autoplay=!0,i.playsInline=!0,i.muted=!0,"srcObject"in i?i.srcObject=e:i.src=window.URL.createObjectURL(e),i.play();let a=this.activeScreen===this.IDCameraScreen?this.IDCameraScreen.querySelector(".id-video-container"):this.backOfIDCameraScreen.querySelector(".id-video-container");i.onloadedmetadata=()=>{a.querySelector(".actions").hidden=!1},t||a.prepend(i),this._IDStream=e,this._IDVideo=i}handleError(e){switch(e.name){case"NotAllowedError":case"SecurityError":this.errorMessage.textContent=`
            Looks like camera access was not granted, or was blocked by a browser
            level setting / extension. Please follow the prompt from the URL bar,
            or extensions, and enable access.
            You may need to refresh to start all over again
          `;break;case"AbortError":this.errorMessage.textContent=`
            Oops! Something happened, and we lost access to your stream.
            Please refresh to start all over again
          `;break;case"NotReadableError":this.errorMessage.textContent=`
            There seems to be a problem with your device's camera, or its connection.
            Please check this, and when resolved, try again. Or try another device.
          `;break;case"NotFoundError":this.errorMessage.textContent=`
            We are unable to find a video stream.
            You may need to refresh to start all over again
          `;break;case"TypeError":this.errorMessage.textContent=`
            This site is insecure, and as such cannot have access to your camera.
            Try to navigate to a secure version of this page, or contact the owner.
          `;break;default:this.errorMessage.textContent=e.message}}_startImageCapture(){this.startImageCapture.disabled=!0;let e=this.imageOutline.getTotalLength();this.imageOutline.style.transition="none",this.imageOutline.style.strokeDasharray=`${e} ${e}`,this.imageOutline.style.strokeDashoffset=e,this.imageOutline.getBoundingClientRect(),this.imageOutline.style.transition=`stroke-dashoffset ${this._videoStreamDurationInMS/1e3}s ease-in-out`,this.imageOutline.style.strokeDashoffset="0",this.smileCTA.style.animation=`fadeInOut ease ${this._videoStreamDurationInMS/1e3}s`,this._imageCaptureInterval=setInterval(()=>{this._capturePOLPhoto()},this._imageCaptureIntervalInMS),this._videoStreamTimeout=setTimeout(()=>{this._stopVideoStream(this._stream)},this._videoStreamDurationInMS)}_captureIDImage(){let e=this._drawIDImage();this.activeScreen===this.IDCameraScreen?this.IDReviewImage.src=e:this.backOfIDReviewImage.src=e,this._data.images.push({image:e.split(",")[1],image_type_id:this.activeScreen===this.IDCameraScreen?3:7}),this._stopIDVideoStream(),this.activeScreen===this.IDCameraScreen?this.setActiveScreen(this.IDReviewScreen):this.setActiveScreen(this.backOfIDReviewScreen)}_drawImage(e,t=this._video){let i=e.getContext("2d");return i.drawImage(t,0,0,t.videoWidth,t.videoHeight,0,0,e.width,e.height),i}_capturePOLPhoto(){let e=document.createElement("canvas");e.width=240,e.height=e.width*this._video.videoHeight/this._video.videoWidth,this._drawImage(e),this._rawImages.push(e.toDataURL("image/jpeg"))}_captureReferencePhoto(){let e=document.createElement("canvas");e.width=480,e.height=e.width*this._video.videoHeight/this._video.videoWidth,this._drawImage(e);let t=e.toDataURL("image/jpeg");this._referenceImage=t,this._data.images.push({image:t.split(",")[1],image_type_id:2})}_skipBackDocument(){this._publishSelectedImages()}async _uploadDocument(e){this.resetErrorMessage();try{let{files:t}=e.target,i=await w.retrieve(t);this._data.images.push({image:i.split(",")[1],image_type_id:this.activeScreen===this.idEntryScreen?3:7});let a=this.activeScreen===this.idEntryScreen?this.IDReviewScreen:this.backOfIDReviewScreen,c=a.querySelector("img");c.src=i,this.setActiveScreen(a)}catch(t){this.handleError(t)}}_drawIDImage(e=this._IDVideo){let t=document.createElement("canvas");if(this.isPortraitCaptureView){t.width=e.videoWidth,t.height=e.videoHeight,t.getContext("2d").drawImage(e,0,0,t.width,t.height);let r=M,o=x,n=.5,d=r*(1+n),m=o*(1+n),l=d,h=m,C=(t.width-l)/2,k=(t.height-h)/2,p=document.createElement("canvas");return p.width=l,p.height=h,p.getContext("2d").drawImage(t,C,k,l,h,0,0,l,h),p.toDataURL("image/jpeg")}t.width=2240,t.height=1260;let i=t.getContext("2d");if(e.videoWidth/e.videoHeight<1){let c=this.activeScreen.querySelector('[class*="image-frame"]:not([hidden]) [href*="image-frame"]'),r=e.getBoundingClientRect(),o=c.getBoundingClientRect(),n=(o.left-r.left)/r.width*e.videoWidth,d=(o.top-r.top)/r.height*e.videoHeight,m=o.width*(e.videoWidth/r.width),l=o.height*(e.videoHeight/r.height);return t.height=t.width*o.height/o.width,i.drawImage(e,n,d,m,l,0,0,t.width,t.height),t.toDataURL("image/jpeg")}return i.drawImage(e,0,0,t.width,t.height),t.toDataURL("image/jpeg")}_stopVideoStream(e){clearTimeout(this._videoStreamTimeout),clearInterval(this._imageCaptureInterval),clearInterval(this._drawingInterval),this.smileCTA.style.animation="none",this._capturePOLPhoto(),this._captureReferencePhoto(),e.getTracks().forEach(a=>a.stop()),this.reviewImage.src=this._referenceImage;let t=this._rawImages.length,i=D(t);this._data.images=this._data.images.concat(i.map(a=>({image:this._rawImages[a].split(",")[1],image_type_id:6}))),this.setActiveScreen(this.reviewScreen)}_stopIDVideoStream(e=this._IDStream){e.getTracks().forEach(t=>t.stop())}async _startIDCamera(){try{let e=await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:"environment",width:{min:1280},zoom:B()?2:1}});this.activeScreen===this.idEntryScreen?this.setActiveScreen(this.IDCameraScreen):this.activeScreen===this.backOfIdEntryScreen&&this.setActiveScreen(this.backOfIDCameraScreen),this.handleIDStream(e)}catch(e){this.handleError(e)}}_selectSelfie(){this.captureID?this.setActiveScreen(this.idEntryScreen):this._publishSelectedImages()}_selectIDImage(e=!1){!this.captureBackOfID||e?this._publishSelectedImages():this.setActiveScreen(this.backOfIdEntryScreen)}_publishSelectedImages(){this.dispatchEvent(new CustomEvent("imagesComputed",{detail:this._data})),this.setActiveScreen(this.thanksScreen)}_exitSmartCamera(){this.dispatchEvent(new CustomEvent("close",{detail:{}}))}_backAndExit(){this.dispatchEvent(new CustomEvent("backExit",{detail:{}}))}async _reStartImageCapture(){this.startImageCapture.disabled=!1,this._rawImages=[],this._data.images=[];try{let e=await navigator.mediaDevices.getUserMedia({audio:!1,video:!0});this.handleSuccess(e)}catch(e){this.handleError(e)}}async _reCaptureIDImage(){let e=this.activeScreen===this.IDReviewScreen?this.idEntryScreen:this.backOfIdEntryScreen;this.setActiveScreen(e),this._data.images.pop()}get captureID(){return this.hasAttribute("capture-id")}get captureBackOfID(){return this.getAttribute("capture-id")==="back"||!1}get hideAttribution(){return this.hasAttribute("hide-attribution")}get showNavigation(){return this.hasAttribute("show-navigation")}get hideBackToHost(){return this.hasAttribute("hide-back-to-host")}get documentType(){return this.getAttribute("document-type")}get isPortraitCaptureView(){return this.getAttribute("document-type")==="GREEN_BOOK"}get documentCaptureModes(){return this.getAttribute("document-capture-modes")||"camera"}get supportBothCaptureModes(){let e=this.documentCaptureModes;return e.includes("camera")&&e.includes("upload")}get doNotUpload(){return this.getAttribute("document-capture-modes")==="camera"}},y=g;window.customElements.define("powered-by-smile-id",f);window.customElements.define("smart-camera-web",y);})();
