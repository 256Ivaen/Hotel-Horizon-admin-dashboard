import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-primary rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-xs font-normal text-gray-900 uppercase tracking-wider">Welcome Back</h1>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">Sign in to your account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;