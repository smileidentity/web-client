import './style.css';
import setupForm from './script';
import '@smileid/web-components/smart-camera-web';

document.querySelector('#app').innerHTML = `
  <div>
    <form name="hosted-web-config" novalidate class="box center flow">
      <select id="language">
        <option value="en">English</option>
        <option value="ar">العربية (Arabic)</option>
      </select>
      <select id="product">
        <option value="">--Select Product---</option>
        <option value="biometric_kyc">Biometric KYC</option>
        <option value="authentication">SmartSelfie Authentication</option>
        <option value="smartselfie">User Registration</option>
        <option value="basic_kyc">Basic KYC</option>
        <option value="enhanced_kyc">Enhanced KYC</option>
        <option selected value="doc_verification">Document Verification</option>
        <option value="enhanced_document_verification">Enhanced Document Verification</option>
      </select>
      <button data-type="primary" id="submitForm">
        Verify with Smile Identity
      </button>
    </form>
  </div>
`;

setupForm();
