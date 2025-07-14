import validator from 'validator';

// Login validation
export const validateLogin = (data) => {
  const errors = {};

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Signup validation
export const validateSignup = (data) => {
  const errors = {};

  // Name validation
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (!validator.isAlpha(data.name.replace(/\s/g, ''))) {
    errors.name = 'Name must contain only alphabetic characters and spaces';
  }

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Mobile validation
  if (!data.mobile) {
    errors.mobile = 'Mobile number is required';
  } else if (!validator.isMobilePhone(data.mobile) || data.mobile.length !== 10) {
    errors.mobile = 'Invalid mobile number';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// Personal details validation
export const validatePersonalDetails = (data) => {
    // console.log(data);
  const errors = {};
  const personalDetails = data.personalDetails || {};

  // User ID validation
  if (!data.userId) {
    errors.userId = 'User ID is required';
  }

  // First name validation
  if (!personalDetails.firstName || personalDetails.firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  // Last name validation
  if (!personalDetails.lastName || personalDetails.lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  }

  // Email validation
  if (!personalDetails.email) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(personalDetails.email)) {
    errors.email = 'Invalid email format';
  }

  // Mobile validation
  if (!personalDetails.mobile) {
    errors.mobile = 'Mobile number is required';
  } else if (!validator.isMobilePhone(personalDetails.mobile) || personalDetails.mobile.length !== 10) {
    errors.mobile = 'Invalid mobile number';
  }

  // Aadhaar number validation (12 digits)
  if (!personalDetails.aadhaarNumber) {
    errors.aadhaarNumber = 'Aadhaar number is required';
  } else if (!validator.matches(personalDetails.aadhaarNumber, /^\d{12}$/)) {
    errors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits';
  }

  // PAN card validation (10 alphanumeric characters)
  if (!personalDetails.panCardNumber) {
    errors.panCardNumber = 'PAN card number is required';
  } else if (!validator.matches(personalDetails.panCardNumber, /^[A-Z0-9]{10}$/)) {
    errors.panCardNumber = 'PAN card must be 10 alphanumeric characters';
  }

  // Gender validation
  if (!personalDetails.gender) {
    errors.gender = 'Gender is required';
  }

  // Marital status validation
  if (!personalDetails.maritalStatus) {
    errors.maritalStatus = 'Marital status is required';
  }

  // Date of birth validation
  if (!personalDetails.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    try {
      const date = new Date(personalDetails.dateOfBirth);
      if (isNaN(date.getTime())) {
        errors.dateOfBirth = 'Invalid date format';
      }
    } catch (e) {
      errors.dateOfBirth = 'Invalid date format';
    }
  }

  // Street address validation
  if (!personalDetails.streetAddress || personalDetails.streetAddress.trim() === '') {
    errors.streetAddress = 'Street address is required';
  }

  // Pin code validation
  if (!personalDetails.pinCode) {
    errors.pinCode = 'Pin code is required';
  } else if (!validator.matches(personalDetails.pinCode, /^\d{6}$/)) {
    errors.pinCode = 'Pin code must be exactly 6 digits';
  }

  // Country validation
  if (!personalDetails.country || personalDetails.country.trim() === '') {
    errors.country = 'Country is required';
  }

  // State validation
  if (!personalDetails.state || personalDetails.state.trim() === '') {
    errors.state = 'State is required';
  }

  // Pin code validation
  if (!personalDetails.pinCode) {
    errors.pinCode = 'Pin code is required';
  } else if (!validator.matches(personalDetails.pinCode, /^\d{6}$/)) {
    errors.pinCode = 'Pin code must be 6 digits';
  }

  // District validation
  if (!personalDetails.district || personalDetails.district.trim() === '') {
    errors.district = 'District is required';
  }

  // City validation
  if (!personalDetails.city || personalDetails.city.trim() === '') {
    errors.city = 'City is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}; 