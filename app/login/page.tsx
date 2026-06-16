import LoginForm from './LoginForm';

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'That link has expired or already been used. Request a new one below.',
  missing: 'Something went wrong. Please try again.',
  unauthorized: 'This app is private. Sign in with the correct Google account.',
};

// Server component — reads searchParams (async in Next 16) and passes error down.
// This avoids useSearchParams() in a client component, which can suspend inside
// a Suspense boundary with no fallback and render nothing.
export default async function LoginPage(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await props.searchParams;
  const errorMessage = params.error ? (ERROR_MESSAGES[params.error] ?? null) : null;
  return <LoginForm errorMessage={errorMessage} />;
}
