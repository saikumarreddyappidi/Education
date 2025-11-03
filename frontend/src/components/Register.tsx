import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/authSlice';
import { RootState, AppDispatch } from '../store';
import { checkApiConnection, getConnectionTroubleshootingSteps } from '../utils/api-utils';
import { toast } from 'react-toastify';

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Check API connectivity when component mounts
    const checkConnection = async () => {
      const isConnected = await checkApiConnection();
      setApiConnected(isConnected);
      
      if (!isConnected) {
        toast.error('Cannot connect to the server. Please check your connection.', {
          position: 'top-center',
          autoClose: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        console.error('API connection check failed');
        console.info(getConnectionTroubleshootingSteps());
      } else {
        console.log('API connection successful!');
      }
    };
    
    checkConnection();
  }, []);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'staff',
    year: '',
    semester: '',
    course: '',
    subject: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
    
    // Clear any previous registration errors when form is changed
    setRegistrationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setRegistrationError(null);
    
    // Check API connectivity before attempting registration
    if (apiConnected === false) {
      setRegistrationError('Cannot connect to the server. Please check your connection and try again.');
      toast.error('Cannot connect to the server. Please check your connection.', {
        position: 'top-center',
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setRegistrationError('Passwords do not match');
      return;
    }

    if (passwordErrors.length > 0) {
      setRegistrationError('Please fix password requirements');
      return;
    }

    // Validate role-specific required fields
    if (formData.role === 'staff') {
      if (!formData.registrationNumber.trim()) {
        setRegistrationError('Staff ID is required for staff registration');
        return;
      }
      if (!formData.subject.trim()) {
        setRegistrationError('Subject is required for staff registration');
        return;
      }
      if (!formData.year.trim()) {
        setRegistrationError('Year is required for staff registration');
        return;
      }
      if (!formData.semester.trim()) {
        setRegistrationError('Semester is required for staff registration');
        return;
      }
    }

    if (formData.role === 'student') {
      if (!formData.registrationNumber.trim()) {
        setRegistrationError('Registration number is required for student registration');
        return;
      }
      if (!formData.year.trim()) {
        setRegistrationError('Year is required for student registration');
        return;
      }
      if (!formData.semester.trim()) {
        setRegistrationError('Semester is required for student registration');
        return;
      }
      if (!formData.course.trim()) {
        setRegistrationError('Course is required for student registration');
        return;
      }
    }

    try {
      console.log('Attempting registration with data:', {
        ...formData,
        password: '[REDACTED]', // Don't log passwords
      });
      
      // Check connection one more time before submitting
      const isConnected = await checkApiConnection();
      if (!isConnected) {
        setRegistrationError('Cannot connect to the server. Please check your connection and try again.');
        return;
      }
      
      const result = await dispatch(register(formData)).unwrap();
      console.log('Registration successful:', result);
      toast.success('Registration successful! Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error?.isNetworkError) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((e: any) => e.msg).join(', ');
      }
      
      setRegistrationError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           backgroundColor: '#fdfcf8',
           backgroundImage: `
             linear-gradient(rgba(200, 216, 236, 0.3) 1px, transparent 1px)
           `,
           backgroundSize: '100% 24px'
         }}>

      <div className="w-full max-w-lg mx-auto bg-[#fdfcf8] shadow-lg rounded-lg border-l-4 border-l-red-300 relative" 
           style={{ minHeight: '600px', maxHeight: 'auto' }}>
        {/* Notebook Binding Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-red-100 to-transparent opacity-50"></div>
        <div className="absolute left-6 top-4 bottom-4 w-px bg-red-200"></div>
        
        {/* Spiral Binding Holes */}
        <div className="absolute left-2 top-12 w-2 h-2 bg-white rounded-full border border-gray-300"></div>
        <div className="absolute left-2 top-20 w-2 h-2 bg-white rounded-full border border-gray-300"></div>
        <div className="absolute left-2 top-28 w-2 h-2 bg-white rounded-full border border-gray-300"></div>
        <div className="absolute left-2 bottom-28 w-2 h-2 bg-white rounded-full border border-gray-300"></div>
        <div className="absolute left-2 bottom-20 w-2 h-2 bg-white rounded-full border border-gray-300"></div>
        <div className="absolute left-2 bottom-12 w-2 h-2 bg-white rounded-full border border-gray-300"></div>

        {/* Connection Status Indicator */}
        {apiConnected !== null && (
          <div className={`absolute top-2 right-2 flex items-center text-xs px-2 py-1 rounded-full ${
            apiConnected 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {apiConnected ? 'Connected' : 'Disconnected'}
          </div>
        )}

        {/* Header Section */}
        <div className="text-center pt-6 pb-4 px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            NANNOTES
          </h2>
          <p className="text-sm text-gray-600">
            Create New Account
          </p>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-6">
          <div className="space-y-4">
            {apiConnected === false && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      Cannot connect to the server. Please check if the backend is running and your connection is stable.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  I am a
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-2 py-2 text-base bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.role === 'student' ? 'Student Registration Number' : 'Staff ID / Employee Number'}
                </label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="block w-full px-2 py-2 text-base bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                  placeholder={formData.role === 'student' ? 'Enter your student registration number' : 'Enter your staff ID or employee number'}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-2 py-2 text-base bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                />
                {passwordErrors.length > 0 && (
                  <div className="mt-1 text-xs text-red-600">
                    <p>Password must have:</p>
                    <ul className="list-disc list-inside">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-2 py-2 text-base bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                />
              </div>

              {formData.role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="block w-full px-2 py-2 text-sm bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                        Semester
                      </label>
                      <select
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                        className="block w-full px-2 py-2 text-sm bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                      >
                        <option value="">Select Semester</option>
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    <input
                      id="course"
                      name="course"
                      type="text"
                      value={formData.course}
                      onChange={handleChange}
                      required
                      className="block w-full px-2 py-2 text-base bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </>
              )}

              {formData.role === 'staff' && (
                <>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Taught
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="block w-full px-2 py-2 text-base bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="block w-full px-2 py-2 text-sm bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                        Semester
                      </label>
                      <select
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                        className="block w-full px-2 py-2 text-sm bg-transparent border-0 border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 transition duration-200"
                      >
                        <option value="">Select Semester</option>
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-sm font-medium text-blue-900">Staff ID</h4>
                    </div>
                    <p className="text-xs text-blue-700">
                      Your Staff ID will be used by students to access your shared notes.
                    </p>
                  </div>
                </>
              )}

              {(error || registrationError) && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                  <span className="text-red-600 text-sm">{registrationError || error}</span>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading || apiConnected === false}
                  className={`w-full py-2.5 px-4 text-white font-medium rounded-lg shadow-lg transition duration-200 hover:shadow-xl ${
                    (isLoading || apiConnected === false) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                  style={{ 
                    backgroundColor: '#3b82f6',
                    fontSize: '15px'
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : apiConnected === false ? (
                    'Server Unavailable'
                  ) : (
                    'Register'
                  )}
                </button>
              </div>

              <div className="text-center pt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#fdfcf8] text-gray-500">
                      Already have an account?
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-gray-600">
                    Want to sign in?{' '}
                    <Link 
                      to="/login" 
                      className="font-medium text-blue-600 hover:text-blue-500 transition duration-200 hover:underline"
                    >
                      Sign in here
                    </Link>
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
