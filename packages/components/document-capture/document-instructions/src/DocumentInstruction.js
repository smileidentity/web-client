import SmartFileUpload from '../../../domain/SmartFileUpload';
import styles from '../../../styles';

function templateString() {
  return `
    ${styles}
    <div id="document-instruction-screen" class="flow center">
        <section className="main">
        ${this.showNavigation
    ? `
            <div class="nav">
                <div class="back-wrapper">
                    <button
                    type="button"
                    data-type="icon"
                    id="back-button"
                    class="back-button icon-btn">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none">
                            <path
                            fill="#DBDBC4"
                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
                            opacity=".4"
                            />
                            <path
                            fill="#001096"
                            d="M15.5 11.25h-5.19l1.72-1.72c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-3 3c-.29.29-.29.77 0 1.06l3 3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-1.72-1.72h5.19c.41 0 .75-.34.75-.75s-.34-.75-.75-.75Z"/>
                        </svg>
                        <div class="back-button-text">Back</div>
                    </button>
                </div>
                <button
                    data-type="icon"
                    type="button"
                    id="id-entry-close"
                    class="close-iframe icon-btn"
                >
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    >
                    <path
                        fill="#DBDBC4"
                        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
                        opacity=".4"
                    />
                    <path
                        fill="#91190F"
                        d="m13.06 12 2.3-2.3c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l-2.3 2.3-2.3-2.3a.754.754 0 0 0-1.06 0c-.29.29-.29.77 0 1.06l2.3 2.3-2.3 2.3c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l2.3-2.3 2.3 2.3c.15.15.34.22.53.22s.38-.07.53-.22c.29-.29.29-.77 0-1.06l-2.3-2.3Z"
                    />
                    </svg>
                    <span class="visually-hidden"
                    >Close SmileIdentity Verification frame</span
                    >
                </button>
            </div>`
    : ''
}
        <header>
        <svg xmlns="http://www.w3.org/2000/svg" width="51" height="78" viewBox="0 0 51 78" fill="none">
        <g clip-path="url(#clip0_604_800)">
          <path d="M37.8059 75.5627L37.9566 23.5025C37.9566 21.8775 36.8118 19.9215 35.4261 19.109L4.12725 1.05345C3.4344 0.632155 2.77167 0.602063 2.31981 0.872896L1.0546 1.59512C0.602739 1.86595 0.301499 2.40762 0.301499 3.22012L0.150879 55.2803C0.150879 56.9053 1.29559 58.8613 2.6813 59.6738L33.9802 77.7294C34.914 78.271 35.9382 77.8197 35.7876 77.9099L37.0528 77.1877C37.5047 76.9169 37.8059 76.3451 37.8059 75.5627ZM36.5407 76.3451C36.5407 76.7363 36.4805 77.0673 36.36 77.3081C36.4805 77.0373 36.5407 76.7062 36.5407 76.3451Z" fill="#7FCBF5"/>
          <path d="M39.0706 74.8405L39.2212 22.7804C39.2212 21.1554 38.0765 19.1993 36.6908 18.3868L5.3919 0.361385C4.69905 -0.0599108 4.03632 -0.0900034 3.58446 0.18083L2.31925 0.903052C1.86739 1.17389 1.56615 1.71555 1.56615 2.52805L1.41553 54.5882C1.41553 56.2132 2.56024 58.1693 3.94595 58.9818L35.2448 77.0373C36.1787 77.579 37.2029 77.1276 37.0523 77.2179L38.3175 76.4956C38.7693 76.2248 39.0706 75.653 39.0706 74.8706V74.8405ZM37.8054 75.6229C37.8054 76.0142 37.7451 76.3452 37.6246 76.5859C37.7451 76.3151 37.8054 75.9841 37.8054 75.6229Z" fill="#7FCBF5"/>
          <path d="M13.1904 40.6255C12.3168 40.5653 11.5035 40.6556 10.7504 40.8963C12.3469 43.394 14.2749 45.5306 16.3534 47.0954C15.0882 45.019 14.0038 42.8222 13.1904 40.6255ZM23.0711 46.313C22.2578 47.5769 21.1733 48.5398 19.878 49.1116C21.9565 49.9542 23.8845 50.0445 25.5112 49.3824C24.7581 48.269 23.9447 47.2458 23.0711 46.313ZM17.5283 41.9195C16.4739 41.3778 15.4196 40.9866 14.3954 40.7759C15.2087 42.9125 16.2631 45.019 17.5283 47.0051V41.9195ZM18.7935 42.6417V47.7273C20.0587 47.2157 21.113 46.3431 21.9264 45.1394C20.9022 44.1463 19.8478 43.3338 18.7935 42.6417ZM11.4432 32.0491L6.83425 29.4009C6.95475 32.5607 8.03921 36.0514 9.87678 39.3917C10.7504 39.0907 11.6842 39.0005 12.6783 39.0607C11.9252 36.6232 11.5035 34.2759 11.4131 32.0792M17.5283 35.6L12.6482 32.7713C12.7084 34.7875 13.1001 36.9241 13.823 39.181C15.028 39.3917 16.2631 39.8431 17.5283 40.5051V35.6ZM23.6736 39.1208L18.7935 36.2921V41.1972C20.0286 41.9796 21.2637 42.9727 22.4686 44.1463C23.1916 42.732 23.5832 41.0468 23.6736 39.1208ZM29.5177 42.4912L24.9087 39.8431C24.8183 41.9495 24.3966 43.8153 23.6133 45.35C24.6074 46.4333 25.5413 47.637 26.4149 48.931C28.2826 47.7273 29.367 45.5005 29.5177 42.4912ZM14.1544 25.7296C13.2507 27.2343 12.7386 29.1602 12.6482 31.357L17.5283 34.1857V28.438C16.3836 27.7157 15.269 26.813 14.1544 25.7597M22.1975 30.394C21.0829 30.1532 19.9382 29.732 18.7935 29.1301V34.8778L23.6736 37.7065C23.5832 35.4195 23.1012 32.8917 22.1975 30.394ZM10.3286 21.306C8.25008 22.3894 6.98487 24.7968 6.80413 27.9866L11.4131 30.6347C11.5035 28.2574 12.0457 26.181 12.9796 24.556C12.0457 23.563 11.142 22.4495 10.3286 21.306ZM26.0534 30.3639C25.24 30.5745 24.3363 30.6347 23.4025 30.5445C24.3363 33.2528 24.8484 35.931 24.9388 38.3986L29.5478 41.0468C29.3972 37.6764 28.1621 33.8245 26.0835 30.3338M17.6187 22.7204C16.5342 23.1417 15.6003 23.8338 14.8171 24.7667C15.7208 25.6093 16.6547 26.3315 17.5885 26.9333V22.7204M18.8537 23.4426V27.6556C19.7876 28.137 20.6913 28.4982 21.6252 28.7088C20.8721 26.9032 19.9382 25.1278 18.8537 23.4426ZM16.4739 21.306C14.6063 20.5838 12.8591 20.4032 11.3529 20.8546C12.0758 21.8176 12.8289 22.7505 13.6423 23.5931C14.4255 22.5699 15.3895 21.7875 16.5041 21.2759M20.0286 23.2921C21.1432 25.0676 22.1071 26.9634 22.8602 28.8593C23.6736 28.9495 24.4267 28.9195 25.1497 28.7389C23.6435 26.5421 21.8963 24.6764 20.0286 23.262M11.142 57.2065C11.142 57.2065 10.8709 56.9357 10.8709 56.7551V55.1602C10.8709 55.0097 10.9914 54.9195 11.142 55.0097L25.1497 63.0745C25.1497 63.0745 25.4208 63.3454 25.4208 63.5259V65.1208C25.4208 65.2713 25.3003 65.3616 25.1497 65.2713L11.142 57.2065ZM11.142 53.1139C11.142 53.1139 10.8709 52.8431 10.8709 52.6625V51.0676C10.8709 50.9171 10.9914 50.8269 11.142 50.9171L25.1497 58.982C25.1497 58.982 25.4208 59.2528 25.4208 59.4333V61.0283C25.4208 61.1787 25.3003 61.269 25.1497 61.1787L11.142 53.1139ZM15.4497 15.0769C15.4497 15.0769 15.1786 14.806 15.1786 14.6255V13.0306C15.1786 12.8801 15.2991 12.7898 15.4497 12.8801L23.2217 17.2134C23.2217 17.2134 23.4928 17.4843 23.4928 17.6648V19.2597C23.4928 19.4102 23.3723 19.5005 23.2217 19.4102L15.4497 15.0769ZM18.1609 49.6232C18.1609 49.6232 18.0705 49.563 18.0103 49.5329H17.95C14.7569 47.5769 11.7143 44.387 9.42492 40.5051C6.95475 36.3222 5.59916 31.8384 5.59916 27.8662C5.59916 23.7134 7.19574 20.644 9.93703 19.4704C12.1963 18.5074 15.0581 18.8986 18.0404 20.5537H18.1006C18.1006 20.5537 18.191 20.644 18.2513 20.6741C18.3115 20.7042 18.3416 20.7343 18.4019 20.7644H18.4621C21.4444 22.5699 24.3062 25.4889 26.5354 29.0398C29.2767 33.4032 30.813 38.2783 30.813 42.431C30.813 46.3732 29.4273 49.2921 26.927 50.6162C24.6074 51.85 21.5649 51.5491 18.3718 49.7435H18.3115C18.3115 49.7435 18.2211 49.6532 18.1609 49.6232ZM33.9158 19.8917L2.70726 1.89631C1.29143 1.08381 0.146714 1.74584 0.146714 3.34075L-0.00390625 55.2806C-0.00390625 56.9056 1.11068 58.8616 2.52651 59.6741L33.735 77.6694C35.1508 78.4819 36.2956 77.8199 36.2956 76.225L36.4462 24.3153C36.4462 22.6903 35.3015 20.7343 33.9158 19.9218" fill="#3B3837"/>
          <path d="M16.3531 47.0959C14.2745 45.5311 12.3466 43.3945 10.75 40.8968C11.5031 40.6561 12.3165 40.5658 13.1901 40.626C14.0034 42.8528 15.0879 45.0496 16.3531 47.0959ZM19.8475 49.1121C21.1428 48.5102 22.2273 47.5774 23.0406 46.3135C23.9142 47.2464 24.7276 48.2996 25.4807 49.3829C23.854 50.045 21.9261 49.9246 19.8475 49.1121ZM17.4677 46.9755C16.2025 45.0195 15.1481 42.8829 14.3348 40.7464C15.359 40.957 16.4134 41.3181 17.4677 41.8899V46.9755ZM18.7028 47.6977V42.6121C19.7872 43.3042 20.8416 44.1167 21.8658 45.1098C21.0525 46.3135 19.968 47.1862 18.7028 47.6977ZM9.81619 39.3621C7.97862 36.0519 6.89416 32.5612 6.77366 29.3714L11.3826 32.0195C11.4429 34.2163 11.8646 36.5635 12.6478 39.001C11.6538 38.9408 10.6898 39.0612 9.84631 39.332M13.8227 39.1214C13.1298 36.8945 12.7382 34.7278 12.6478 32.7116L17.5279 35.5403V40.4454C16.2627 39.7834 15.0276 39.332 13.8227 39.1214ZM22.4683 44.1167C21.2633 42.9431 20.0282 41.9501 18.763 41.1677V36.2626L23.6732 39.0913C23.5829 41.0172 23.1913 42.7024 22.4683 44.1167ZM26.4145 48.9014C25.5409 47.6075 24.6071 46.4038 23.613 45.3204C24.3962 43.7556 24.818 41.92 24.9083 39.8135L29.5173 42.4616C29.3667 45.4709 28.2822 47.6977 26.4145 48.9014ZM12.6478 31.2973C12.7382 29.1005 13.2503 27.1746 14.154 25.67C15.2686 26.7232 16.4134 27.626 17.5581 28.3482V34.0959L12.6478 31.2672M18.763 34.788V29.0403C19.9379 29.6422 21.0525 30.0635 22.1972 30.3042C23.0708 32.832 23.5829 35.3297 23.6732 37.6167L18.7931 34.788M6.83391 27.8968C7.01465 24.707 8.24974 22.2996 10.3584 21.2163C11.1718 22.3899 12.0755 23.4732 13.0093 24.4663C12.0755 26.0913 11.5333 28.1676 11.4429 30.545L6.83391 27.8968ZM24.9385 38.3389C24.8481 35.8714 24.336 33.1931 23.4021 30.4848C24.336 30.5751 25.2397 30.4848 26.053 30.3042C28.1316 33.795 29.3667 37.6468 29.5173 41.0172L24.9083 38.369M17.5581 26.9339C16.6242 26.332 15.6904 25.6098 14.7867 24.7672C15.5398 23.8343 16.4736 23.1422 17.5882 22.7209V26.9339M18.8233 27.6561V23.4431C19.9077 25.1283 20.8416 26.9038 21.5947 28.7093C20.691 28.4987 19.7571 28.1376 18.8233 27.6561ZM13.6118 23.6237C12.7985 22.7811 12.0454 21.8482 11.3224 20.8852C12.8286 20.4339 14.6059 20.5843 16.4435 21.3366C15.3289 21.8482 14.3649 22.6306 13.5817 23.6538M22.7695 28.9501C22.0164 27.0542 21.0525 25.1584 19.9379 23.3829C21.8056 24.7973 23.5527 26.663 25.0589 28.8598C24.336 29.0102 23.5829 29.0403 22.7695 28.9802M18.1907 20.795C18.1907 20.795 18.1003 20.7348 18.04 20.7047H17.9798C14.9975 19.0195 12.1357 18.6283 9.87644 19.5913C7.13515 20.7649 5.53857 23.8343 5.53857 27.9871C5.53857 32.1399 6.89416 36.413 9.36433 40.626C11.6538 44.5079 14.6963 47.6977 17.8894 49.6237H17.9497C17.9497 49.6237 18.04 49.744 18.1003 49.7741C18.1605 49.8042 18.1907 49.8343 18.2509 49.8644H18.3112C21.5043 51.67 24.5468 52.001 26.8664 50.7672C29.3667 49.4431 30.7223 46.5241 30.7524 42.582C30.7524 38.4292 29.2161 33.5542 26.4748 29.2209C24.2456 25.67 21.3838 22.7209 18.4015 20.9454H18.3413C18.3413 20.9454 18.2509 20.8552 18.1907 20.8251" fill="#7FCBF5"/>
          <path d="M40.6682 50.1652H40.6381C34.9149 50.1652 30.2754 54.7999 30.2754 60.517V60.5471C30.2754 66.2643 34.9149 70.899 40.6381 70.899H40.6682C46.3913 70.899 51.0309 66.2643 51.0309 60.5471V60.517C51.0309 54.7999 46.3913 50.1652 40.6682 50.1652Z" fill="#43C15F"/>
          <path d="M38.8267 65.8728L33.2236 60.426L34.8503 58.7408L38.8267 62.5626L46.418 55.22L48.0447 56.9052L38.8568 65.8728H38.8267Z" fill="#E5E7E7"/>
        </g>
        <defs>
          <clipPath id="clip0_604_800">
            <rect width="51" height="78" fill="white"/>
          </clipPath>
        </defs>
      </svg>
            <h1>${this.title}</h1>
        <p class="description text-sm font-normal">
            We'll use it to verify your identity.
          </p>
          <p class="description padding-bottom-2">
          Please follow the instructions below.
          </p>
        </header>
        <div class="flow instructions-wrapper">
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
                    fill="#001096"
                    />
                    <path
                    d="M19.6064 4.5419H18.394L18.9912 0L19.6064 4.5419Z"
                    fill="#001096"
                    />
                    <path
                    d="M26.7541 6.77667L25.7046 6.17048L28.4913 2.54239L26.7541 6.77667Z"
                    fill="#001096"
                    />
                    <path
                    d="M31.8298 12.2957L31.2236 11.2462L35.4489 9.49097L31.8298 12.2957Z"
                    fill="#001096"
                    />
                    <path
                    d="M33.4674 19.6062V18.3938L38.0003 18.9909L33.4674 19.6062Z"
                    fill="#001096"
                    />
                    <path
                    d="M31.2236 26.7538L31.8298 25.7043L35.4579 28.491L31.2236 26.7538Z"
                    fill="#001096"
                    />
                    <path
                    d="M25.7046 31.8295L26.7541 31.2233L28.5094 35.4486L25.7046 31.8295Z"
                    fill="#001096"
                    />
                    <path
                    d="M18.394 33.4671H19.6064L19.0093 38L18.394 33.4671Z"
                    fill="#001096"
                    />
                    <path
                    d="M11.2464 31.2233L12.2959 31.8295L9.50928 35.4576L11.2464 31.2233Z"
                    fill="#001096"
                    />
                    <path
                    d="M6.17068 25.7043L6.77687 26.7538L2.55164 28.509L6.17068 25.7043Z"
                    fill="#001096"
                    />
                    <path
                    d="M4.54215 18.3938V19.6062L0.000244141 19.009L4.54215 18.3938Z"
                    fill="#001096"
                    />
                    <path
                    d="M6.77689 11.2462L6.1707 12.2957L2.5426 9.50903L6.77689 11.2462Z"
                    fill="#001096"
                    />
                    <path
                    d="M12.296 6.17047L11.2464 6.77666L9.49121 2.55142L12.296 6.17047Z"
                    fill="#001096"
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
                    Make sure you are in a well-lit environment where your face is
                    clear and visible
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
                fill="#001096"
                />
                <path
                d="M37.3716 14.7438H0.574875C0.466458 15.1625 0.379725 15.5813 0.303833 16.011H37.6426C37.5667 15.5813 37.48 15.1625 37.3716 14.7438Z"
                fill="#001096"
                />
                <path
                d="M37.7727 16.8485H0.173703C0.119494 17.2342 0.0869685 17.6198 0.0544434 18.0055H37.892C37.8594 17.6198 37.8269 17.2342 37.7727 16.8485Z"
                fill="#001096"
                />
                <path
                d="M37.9462 19.4711C37.9462 19.2948 37.9462 19.1295 37.9353 18.9532H0.0110865C0.000244802 19.1295 0.000244141 19.2948 0.000244141 19.4711C0.000244141 19.6474 0.000244802 19.8347 0.0110865 20.011H37.9353C37.9462 19.8347 37.9462 19.6474 37.9462 19.4711Z"
                fill="#001096"
                />
                <path
                d="M37.8811 21.0579H0.0653076C0.086991 21.3774 0.119515 21.697 0.162882 22.0055H37.7836C37.8269 21.697 37.8595 21.3774 37.8811 21.0579Z"
                fill="#001096"
                />
                <path
                d="M37.5992 23.1625H0.347168C0.401376 23.449 0.466426 23.7245 0.531477 24H37.4149C37.48 23.7245 37.545 23.449 37.5992 23.1625Z"
                fill="#001096"
                />
                <path
                d="M37.0788 25.2672H0.867554C0.954287 25.5096 1.03018 25.7631 1.11691 26.0055H36.8295C36.9162 25.7631 37.0029 25.5096 37.0788 25.2672Z"
                fill="#001096"
                />
                <path
                d="M36.2874 27.3719H1.65906L1.95178 28H35.9947L36.2874 27.3719Z"
                fill="#001096"
                />
                <path
                d="M35.2032 29.4766H2.75403C2.84799 29.6529 2.95641 29.8292 3.07928 30.0055H34.878L35.2032 29.4766Z"
                fill="#001096"
                />
                <path
                d="M33.7396 31.5813H4.20679L4.54288 32H33.4035L33.7396 31.5813Z"
                fill="#001096"
                />
                <path
                d="M31.7989 33.6859H6.14746L6.49439 33.9945H31.452L31.7989 33.6859Z"
                fill="#001096"
                />
                <path
                d="M29.0993 35.7906H8.84705L9.18314 36H28.7632L29.0993 35.7906Z"
                fill="#001096"
                />
                <path
                d="M34.2384 8.01102C33.8914 7.53719 33.5228 7.07438 33.1325 6.63361C29.8258 2.60055 24.6977 0 18.9407 0C12.891 0 7.53525 2.86501 4.25021 7.26171H4.28274C4.08759 7.51515 3.89244 7.75757 3.70813 8.01102H34.2384Z"
                fill="#001096"
                />
                <path
                d="M34.531 8.44077H3.41533C3.06839 8.94765 2.74314 9.47658 2.43958 10.0165H35.5068C35.2124 9.47215 34.8866 8.94597 34.531 8.44077Z"
                fill="#001096"
                />
                <path
                d="M35.7887 10.5344H2.15776C1.9084 11.0193 1.68072 11.5151 1.47473 12.011H36.4717C36.2657 11.5151 36.0381 11.0193 35.7887 10.5344Z"
                fill="#001096"
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
                    Hold your phone steady so the selfie is clear and sharp. Don't
                    take blurry images.
                </p>
            </div>
        </div>
        <div id="error" class='color-red'>
        </div>
        </div>
        </section>
    <section className="footer">
    <div class='flow'>
    ${this.supportBothCaptureModes || this.documentCaptureModes === 'camera'
    ? `
    <button data-variant='solid full-width' class='button' type='button' id='take-photo'>
        Take Photo
    </button>
    `
    : ''
}
    ${this.supportBothCaptureModes || this.documentCaptureModes === 'upload'
    ? `
    <label id='upload-photo-label' data-variant='${this.supportBothCaptureModes ? 'outline' : 'solid'
}' class='button'>
        <input type='file' hidden onclick='this.value=null;' id='upload-photo' name='document' accept='image/png, image/jpeg' />
        <span>Upload Photo</span>
    </label>
    `
    : ''
}
</div>
${this.hideAttribution ? '' : '<powered-by-smile-id></powered-by-smile-id>'}
    </section>
  </div>
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

    this.backButton = this.shadowRoot.querySelector('#back-button');
    this.takeDocumentPhotoButton = this.shadowRoot.querySelector('#take-photo');
    this.uploadDocumentPhotoButton = this.shadowRoot.querySelector('#upload-photo');

    const CloseIframeButtons = this.shadowRoot.querySelectorAll('.close-iframe');

    if (this.backButton) {
      this.backButton.addEventListener('click', (e) => {
        this.handleBackEvents(e);
      });
    }

    CloseIframeButtons.forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          this.closeWindow();
        },
        false,
      );
    });

    if (this.takeDocumentPhotoButton) {
      this.takeDocumentPhotoButton.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('DocumentInstruction::StartCamera', {
            detail: {},
          }),
        );
      });
    }

    if (this.uploadDocumentPhotoButton) {
      this.uploadDocumentPhotoButton.addEventListener('change', async (event) => {
        this.shadowRoot.querySelector('#error').innerHTML = '';
        try {
          const { files } = event.target;

          // validate file, and convert file to data url
          const fileData = await SmartFileUpload.retrieve(files);

          this.dispatchEvent(
            new CustomEvent('DocumentInstruction::DocumentChange', {
              detail: { image: fileData },
            }),
          );
        } catch (error) {
          this.shadowRoot.querySelector('#error').innerHTML = error.message;
        }
      });
    }
  }

  get hideBack() {
    return this.hasAttribute('hide-back-to-host');
  }

  get showNavigation() {
    return this.hasAttribute('show-navigation');
  }

  get themeColor() {
    return this.getAttribute('theme-color') || '#043C93';
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

  handleBackEvents() {
    this.dispatchEvent(new CustomEvent('SmileIdentity::Exit'));
  }

  closeWindow() {
    window.parent.postMessage('SmileIdentity::Close', '*');
  }
}

if ('customElements' in window && !customElements.get('document-instruction')) {
  window.customElements.define('document-instruction', DocumentInstruction);
}

export default DocumentInstruction;
