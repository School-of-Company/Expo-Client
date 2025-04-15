import { SignUpForm } from '@/widgets/signup';

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-[792px] p-16">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;
