const eKYCSmartSelfieSandbox = (function eKYCSmartSelfieSandbox() {
	'use strict';

	/**
	 * Steps
	 *
	 * 1. Get ID Country and ID Type
	 * 2. Get required fields for the ID Country and ID Type
	 * 3. Prefill Data for required fields
	 * 4. Profit
	 */

	// ACTION: Get `hosted_web` product constraints
	const constraints = JSON.parse(localStorage.getItem('SmileIdentityConstraints'));

	// ACTION: Get ID Country and ID Type
	const country = document.querySelector('#country').value;
	const IDType = document.querySelector('#id_type').value;

	// ACTION: Get Required Fields
	const sandboxPII = {
		first_name: 'Ciroma',
		last_name: 'Adekunle',
		day: '01',
		month: '01',
		year: '1970',
	};

	const { required_fields: requiredFields, test_data: testData } = constraints[country].id_types[IDType];

	requiredFields.forEach((field) => {
		if (field === 'country' || field === 'id_type' || field === 'user_id' || field === 'job_id') return;

		const element = document.querySelector(`#${field}`);

		if (field === 'id_number') {
			element.setAttribute('value', testData);
			element.setAttribute('readonly', true);
		} else if (field === 'dob') {
			const day = element.querySelector('#day');
			const month = element.querySelector('#month');
			const year = element.querySelector('#year');

			day.setAttribute('readonly', true);
			day.setAttribute('value', sandboxPII.day);
			month.setAttribute('readonly', true);
			month.setAttribute('value', sandboxPII.month);
			year.setAttribute('readonly', true);
			year.setAttribute('value', sandboxPII.year);
		} else {
			element.setAttribute('value', sandboxPII[field]);
			element.setAttribute('readonly', true);
		}
	});
}());
