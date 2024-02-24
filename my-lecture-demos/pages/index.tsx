import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to the Lecture Demos</h1>
      <Link href="/demos/demo1">
        Go to Lecture 1 Demo
      </Link>
    </div>
  );
}
